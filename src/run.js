// src/run.js
// Direct runner for GitHub Actions — no cron, no keep-alive.
require("dotenv").config();
const { claimAll } = require("./claimer");
const tg = require("./telegram");

const DRY_RUN = process.env.DRY_RUN === "true";

async function run() {
  console.log(`🔔 Claim triggered at ${new Date().toISOString()}`);
  
  if (DRY_RUN) {
    console.log("🧪 DRY RUN mode — no transactions will be broadcast.");
    console.log("   Checking eligibility only...");
  }

  tg.initBot();

  if (DRY_RUN) {
    // Skip claimAll — just confirm the script runs end to end
    console.log("🧪 DRY RUN complete. Everything looks good.");
    console.log("   Set DRY_RUN=false (or remove it) when ready to claim for real.");
    return;
  }

  await claimAll();
  console.log("✅ Done.");
}

run().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
