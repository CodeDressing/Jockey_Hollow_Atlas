const assert = require("node:assert/strict");
const {spawn, execFileSync} = require("node:child_process");
const {mkdtempSync, rmSync} = require("node:fs");
const {tmpdir} = require("node:os");
const path = require("node:path");
const {randomBytes} = require("node:crypto");
const {chromium, webkit, devices} = require("playwright");

const origin = "http://127.0.0.1:8000";
const temp = mkdtempSync(path.join(tmpdir(), "atlas-access-"));
const python = process.env.ATLAS_PYTHON || "python";
const password = randomBytes(24).toString("base64url");
const env = {...process.env, ATLAS_LOCAL_TEST: "1", DJANGO_SETTINGS_MODULE: "atlas_access.settings",
  ATLAS_TEST_DATABASE: path.join(temp, "test.sqlite3"), ATLAS_TEST_VIEWER_PASSWORD: password};
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
    await page.goto(origin + "/#AN2-F36");
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
    assert.match(await page.locator(options.isMobile ? "#mSpec" : "#specList").innerText(), /AN2-F38/);
    await page.getByRole("button", {name: "Sign out"}).click();
    assert.equal((await anonymous.request.get(origin + photo)).status(), 404);
    django("shell", "-c", "from atlas_access.models import AccessPolicy; AccessPolicy.objects.update(mode='private')");
    await page.reload();
    assert.equal(await page.getByRole("heading", {name: "Limited Beta"}).count(), 0);
    console.log(label + " access, bookmark, search, gallery, sign-out and mode switching passed");
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
    const browsers = [[chromium, "Desktop Chromium", {}], [chromium, "Android Chromium", devices["Pixel 7"]]];
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
