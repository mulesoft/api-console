const fs = require("fs");
// eslint-disable-next-line import/no-extraneous-dependencies
const shell = require("shelljs");

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
}
