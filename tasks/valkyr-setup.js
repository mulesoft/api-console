const fs = require("fs");

function hasAccessToCache() {
  const cachePathMap = {
    darwin: '/Library/Caches',
    linux: '/AppData/Local'
  }
  const { platform } = process;
  console.log('Platform:', platform)
  try {
    const cachePath = cachePathMap[platform];
    fs.accessSync(cachePath);
    console.log(fs.readdirSync(cachePath))
  } catch (e) {
    console.log("Does not have access", e);
    return false;
  }
  console.log("Does have access");
  return true;  
}

if (process.env.NODE_ENV === "production" || !hasAccessToCache()) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = "./.pw-browsers";
} else {
  console.log("NODE_ENV: ", process.env.NODE_ENV);
  // console.log("env variables: ", JSON.stringify(process.env, null, 2));
}
 