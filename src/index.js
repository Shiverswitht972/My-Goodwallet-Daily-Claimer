// src/index.js
// ─── GoodDollar Auto-Claimer — Entry Point ────────────────────────────────────

require("dotenv").config();
const cron = require("node-cron");
const { claimAll } = require("./claimer");
const tg = require("./telegram");
const { ethers } = require("ethers");

// ─── Startup ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      GoodDollar Auto-Claimer Bot             ║");
  console.log("║      Celo + Fuse Networks                    ║");
  console.log("╚══════════════════════════════════════════════╝");

  // Validate required env vars
  validateEnv();

  // Init Telegram bot
  tg.initBot();

  // Get wallet address for display
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  const wallet = new ethers.Wallet(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  );

  console.log(`\n👛 Wallet address: ${wallet.address}`);
  console.log(`📅 Claim schedule: ${process.env.CRON_SCHEDULE || "0 9 * * *"} (UTC)`);
  console.log(`🌐 Networks: ${getEnabledNetworks()}`);
  console.log(`📣 Telegram: ${process.env.TELEGRAM_BOT_TOKEN ? "enabled" : "disabled"}\n`);

  // Send startup notification
  await tg.notifyStartup(wallet.address);

  // ── Run immediately on startup if CLAIM_ON_START=true ──────────────────────
  if (process.env.CLAIM_ON_START === "true") {
    console.log("🔥 CLAIM_ON_START=true — running claim now...");
    await claimAll();
  }

  // ── Schedule daily claim ───────────────────────────────────────────────────
  // Default: every day at 09:00 UTC
  // Override with CRON_SCHEDULE env var (standard cron syntax)
  const schedule = process.env.CRON_SCHEDULE || "0 9 * * *";

  if (!cron.validate(schedule)) {
    console.error(`❌ Invalid CRON_SCHEDULE: "${schedule}"`);
    process.exit(1);
  }

  console.log(`⏰ Scheduler armed. Next claim at: ${schedule} (UTC)`);

  cron.schedule(schedule, async () => {
    console.log(`\n🔔 Cron triggered at ${new Date().toISOString()}`);
    try {
      await claimAll();
    } catch (err) {
      console.error("💥 Unhandled error during claimAll:", err);
    }
  }, {
    timezone: "UTC",
  });

  // Keep process alive
  console.log("\n✅ Bot is running. Press Ctrl+C to stop.\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateEnv() {
  const required = ["WALLET_PRIVATE_KEY", "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.includes("WALLET_PRIVATE_KEY")) {
    console.error("❌ WALLET_PRIVATE_KEY is required. Check your .env file.");
    process.exit(1);
  }

  if (missing.includes("TELEGRAM_BOT_TOKEN") || missing.includes("TELEGRAM_CHAT_ID")) {
    console.warn("⚠️  Telegram not configured — notifications will be skipped.");
    console.warn("   Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env to enable them.\n");
  }
}

function getEnabledNetworks() {
  const nets = [];
  if (process.env.ENABLE_CELO !== "false") nets.push("Celo");
  if (process.env.ENABLE_FUSE !== "false") nets.push("Fuse");
  return nets.join(" + ") || "none";
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled rejection:", err);
});

main().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
