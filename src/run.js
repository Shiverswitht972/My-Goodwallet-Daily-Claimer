// src/run.js
// Direct runner for GitHub Actions — no cron, no keep-alive.
require("dotenv").config();
const { claimAll } = require("./claimer");
const tg = require("./telegram");

async function run() {
  console.log(`🔔 Claim triggered at ${new Date().toISOString()}`);
  tg.initBot();
  await claimAll();
  console.log("✅ Done.");
}

run().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
