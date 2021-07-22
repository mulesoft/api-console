const fs = require("fs");
// eslint-disable-next-line import/no-extraneous-dependencies
const shell = require("shelljs");
const path = require("path");

function hasAccessToCache() {
  const cachePathMap = {
    darwin: "/Library/Caches",
    linux: "/AppData/Local",
  };
  const { platform } = process;
  console.log("Platform:", platform);
  try {
    const cachePath = cachePathMap[platform];
    fs.accessSync(cachePath);
    console.log(fs.readdirSync(cachePath));
  } catch (e) {
    console.log("Does not have access", e);
    return false;
  }
  console.log("Does have access");
  return true;
}

if (process.env.NODE_ENV === "production" || !hasAccessToCache()) {
  console.log("Installing playwright with local browsers path.");
  shell.exec("PLAYWRIGHT_BROWSERS_PATH=0 npm i -D playwright");
  console.log("Checking for local browsers in node_modules/playwright...");
  const exists = fs.existsSync(
    path.join(__dirname, "..", "node_modules", "playwright", ".local-browsers")
  );
  console.log('Dir exists: ', exists);
}
