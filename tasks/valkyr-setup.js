if (process.env.NODE_ENV === "production") {
  process.env.PLAYWRIGHT_BROWSERS_PATH = "./.pw-browsers";
} else {
    console.log('NODE_ENV: ', process.env.NODE_ENV);
    console.log('env variables: ', JSON.stringify(process.env, null , 2));
}
