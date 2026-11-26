const fs = require("node:fs");
const path = require("node:path");
const {spawnSync} = require("node:child_process");
const {gallery} = require("../scripts/verify_atlas_images.cjs");

const root = path.resolve(__dirname, "..");
const {images, sourcePaths} = gallery();
const entries = [
  "index.html", "styles.css", "sidebar-controls.css", "codedressing.css",
  "safety.html", "sandbox.html", "trametes.html",
  ...sourcePaths, ...images.keys(),
];

function addSimulationFiles(directory) {
  for (const entry of fs.readdirSync(path.join(root, directory), {withFileTypes: true})) {
    const name = path.posix.join(directory, entry.name);
    if (/classified|gym_juno_encrypted|gym_juno_cloud/i.test(name)) continue;
    if (entry.isDirectory()) {
      addSimulationFiles(name);
    } else if (entry.isFile() && /\.(?:js|css|png|webp|jpg|jpeg|gif|avif)$/i.test(name)) {
      entries.push(name);
    }
  }
}
addSimulationFiles("mycosim");
const result = spawnSync(process.env.ATLAS_PYTHON || "python", [path.join(__dirname, "check_media.py")], {
  input: JSON.stringify([...new Set(entries)].sort()), cwd: root, stdio: ["pipe", "inherit", "inherit"],
});
if (result.status !== 0) process.exit(1);
