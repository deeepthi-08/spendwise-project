const http = require("http");

function check(name, url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${name} - ${res.statusCode}`);
          resolve();
        } else {
          console.log(`❌ ${name} - ${res.statusCode}`);
          reject(new Error(`${name} failed`));
        }
      })
      .on("error", (error) => {
        console.log(`❌ ${name} - ${error.message}`);
        reject(error);
      });
  });
}

async function runSmokeTests() {
  console.log("Running SpendWise smoke tests...\n");

  await check("Frontend", "http://localhost:3000");
  await check("Backend health", "http://localhost:4000/health");

  console.log("\n🎉 All smoke tests passed!");
}

runSmokeTests().catch(() => {
  console.error("\n❌ Smoke tests failed.");
  process.exit(1);
});