const fs = require("fs");

function hasAccessToCache() {
  try {
    fs.accessSync("\\AppData\\Local\\ms-playwright");
    console.log(fs.readdirSync("\\AppData\\Local\\ms-playwright"))
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
