const assert = require("node:assert/strict");
const {spawn, execFileSync} = require("node:child_process");
const {mkdtempSync, readFileSync, rmSync} = require("node:fs");
const {tmpdir} = require("node:os");
const path = require("node:path");
const {randomBytes} = require("node:crypto");
const {chromium, webkit, devices} = require("playwright");

const origin = "http://127.0.0.1:8000";
const temp = mkdtempSync(path.join(tmpdir(), "atlas-access-"));
const python = process.env.ATLAS_PYTHON || "python";
const password = randomBytes(24).toString("base64url");
const passphrase = randomBytes(12).toString("hex");
const env = {...process.env, ATLAS_LOCAL_TEST: "1", DJANGO_SETTINGS_MODULE: "atlas_access.settings",
  ATLAS_TEST_DATABASE: path.join(temp, "test.sqlite3"), ATLAS_TEST_VIEWER_PASSWORD: password,
  ATLAS_ENTRY_PASSPHRASE: passphrase};
const photo = "/assets/an2-f36/field/AN2-F36%20field%20(1).jpg";

function django(...args) {
  return execFileSync(python, ["-m", "django", ...args], {env, stdio: ["ignore", "pipe", "pipe"]});
}

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      if ((await fetch(origin + "/healthz")).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("The disposable Atlas test server did not start");
}

async function check(browser, label, options) {
  const anonymous = await browser.newContext(options);
  try {
    const page = await anonymous.newPage();
    const setLockdown = enabled => django("shell", "-c",
      "from django.db.models import F; from atlas_access.models import AccessPolicy; " +
      `AccessPolicy.objects.update(lockdown_enabled=${enabled ? "True" : "False"}, lockdown_generation=F("lockdown_generation")+1)`);
    setLockdown(false);
    const publicLanding = await page.goto(origin + "/#AN2-F36");
    assert.deepEqual(await publicLanding.body(), readFileSync("index.html"));
    await page.locator("#enterAtlas").waitFor();
    assert.equal(await page.locator('input[type="password"]').count(), 0);
    assert.deepEqual(await page.locator(".entry-actions button").allTextContents(), ["Enter Atlas", "Play Hyphae Run"]);
    assert.equal((await anonymous.request.get(origin + photo)).status(), 200);

    setLockdown(true);
    await page.reload();
    await page.getByRole("link", {name: "Sign in"}).waitFor();
    assert.equal(await page.locator("script[src='data.js']").count(), 0);
    assert.equal((await anonymous.request.get(origin + photo)).status(), 404);
    assert.equal((await anonymous.request.get(origin + "/data.js")).status(), 404);

    django("shell", "-c", "from atlas_access.models import AccessPolicy; AccessPolicy.objects.update(mode='limited_beta')");
    await page.reload();
    await page.getByRole("heading", {name: "Limited Beta"}).waitFor();
    await page.getByText("No specimens have been approved", {exact: false}).waitFor();
    assert.equal((await anonymous.request.get(origin + photo)).status(), 404);

    await page.getByRole("link", {name: "Sign in"}).click();
    await page.locator("input[name=login]").fill("viewer@example.test");
    await page.locator("input[name=password]").fill(password);
    const form = page.locator("form").filter({has: page.locator("input[name=password]")});
    await form.getByRole("button", {name: "Sign In", exact: true}).click();
    try {
      await page.waitForURL(url => url.pathname === "/", {timeout: 5000});
    } catch (error) {
      console.error("Sign-in response", new URL(page.url()).pathname, (await page.locator("body").innerText({timeout: 1500})).slice(0, 350));
      throw error;
    }
    await page.locator("#enterAtlas").click();
    const cards = page.locator("#main .image-wrap[data-file^='assets/an2-f36/']");
    await cards.first().waitFor();
    const visible = cards.first().locator("img");
    await visible.scrollIntoViewIfNeeded();
    assert.ok(await visible.evaluate(async image => { await image.decode(); return image.naturalWidth > 0; }));
    await cards.first().click();
    const image = page.locator("#viewerImg");
    assert.ok(await image.evaluate(async element => { await element.decode(); return element.naturalWidth > 0; }));
    await page.locator("#closeViewer").click();
    const search = page.locator(options.isMobile ? "#mSearch" : "#search");
    await search.fill("AN2-F38");
    if (options.isMobile) {
      const results = page.locator("#mSpec");
      await results.locator('option[value="AN2-F38"]').waitFor({state: "attached"});
      await results.selectOption("AN2-F38");
    } else {
      await page.locator("#specList").getByText("AN2-F38", {exact: false}).first().click();
    }
    await page.locator("#main .image-wrap[data-file^='assets/an2-f38/']").first().waitFor();
    await page.getByRole("button", {name: "Sign out"}).click();
    assert.equal((await anonymous.request.get(origin + photo)).status(), 404);
    django("shell", "-c", "from atlas_access.models import AccessPolicy; AccessPolicy.objects.update(mode='private')");
    await page.goto(origin + "/#AN2-F36");
    await page.reload();
    assert.equal(await page.getByRole("heading", {name: "Limited Beta"}).count(), 0);
    const input = page.getByLabel("Atlas passphrase");
    const enter = page.getByRole("button", {name: "Enter Atlas", exact: true});
    assert.equal(await input.getAttribute("type"), "password");
    assert.ok(await enter.isDisabled());
    const dimmed = await enter.evaluate(node => Number(getComputedStyle(node).opacity));
    const box = await input.boundingBox();
    const button = await enter.boundingBox();
    if (options.viewport?.width === 320) {
      assert.ok(button.y > box.y + box.height, "narrow phone should stack the controls");
    } else {
      assert.ok(box.x + box.width <= button.x && Math.abs(box.y - button.y) < 2,
        "passphrase box should be immediately left of Enter Atlas");
    }
    await input.fill("incorrect");
    assert.ok(await enter.isEnabled());
    assert.ok(await enter.evaluate(node => Number(getComputedStyle(node).opacity)) > dimmed);
    await input.fill("");
    assert.ok(await enter.isDisabled());
    await input.fill("incorrect");
    await input.press("Enter");
    await page.getByRole("alert").filter({hasText: "Incorrect passphrase"}).waitFor();
    assert.equal(await page.locator("script[src='data.js']").count(), 0);
    assert.equal((await anonymous.request.get(origin + photo)).status(), 404);
    await input.fill(passphrase);
    await page.locator("#enterAtlas:enabled").waitFor();
    const [unlockResponse] = await Promise.all([
      page.waitForResponse(response => new URL(response.url()).pathname === "/unlock/" && response.request().method() === "POST"),
      input.press("Enter"),
    ]);
    assert.equal(unlockResponse.status(), 302, "Valid passphrase should redirect to the Atlas");
    await page.locator("#entryGate").waitFor({state: "hidden", timeout: 7000});
    await page.locator("#main .image-wrap[data-file^='assets/an2-f36/']").first().waitFor();
    assert.equal((await anonymous.request.get(origin + photo)).status(), 200);

    setLockdown(false);
    const restored = await page.goto(origin + "/");
    assert.deepEqual(await restored.body(), readFileSync("index.html"));
    assert.equal(await page.locator('input[type="password"]').count(), 0);
    assert.deepEqual(await page.locator(".entry-actions button").allTextContents(), ["Enter Atlas", "Play Hyphae Run"]);
    console.log(label + " account access, passphrase states, direct links, gallery and public layout passed");
  } finally {
    await anonymous.close();
  }
}

async function run() {
  let server;
  try {
    django("migrate", "--noinput");
    django("createcachetable");
    django("shell", "-c", [
      "import os",
      "from django.contrib.auth import get_user_model",
      "from atlas_access.models import Membership",
      "user = get_user_model().objects.create_user(username='viewer', email='viewer@example.test', password=os.environ['ATLAS_TEST_VIEWER_PASSWORD'])",
      "Membership.objects.create(user=user, role='viewer', active=True)",
    ].join("; "));
    server = spawn(python, ["-m", "django", "runserver", "127.0.0.1:8000", "--noreload"], {env, stdio: "ignore"});
    await waitForServer();
    const browsers = [
      [chromium, "Desktop Chromium", {}],
      [chromium, "Android Chromium", devices["Pixel 7"]],
      [chromium, "320px Chromium", {...devices["Pixel 7"], viewport: {width: 320, height: 740}}],
    ];
    if (!process.env.ATLAS_SKIP_WEBKIT) browsers.push([webkit, "iPhone WebKit", devices["iPhone 13"]]);
    for (const [engine, name, options] of browsers) {
      const browser = await engine.launch();
      try {
        await check(browser, name, options);
      } finally {
        await browser.close();
      }
    }
  } finally {
    if (server) server.kill();
    rmSync(temp, {recursive: true, force: true});
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
