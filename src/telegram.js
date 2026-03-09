// src/telegram.js
// ─── Telegram Bot Notifications ───────────────────────────────────────────────

const TelegramBot = require("node-telegram-bot-api");

let bot = null;

function initBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.warn("⚠️  Telegram env vars not set — notifications disabled.");
    return null;
  }
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  return bot;
}

async function sendMessage(text) {
  if (!bot) return;
  try {
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, text, {
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error("❌ Telegram send failed:", err.message);
  }
}

// ─── Message Templates ────────────────────────────────────────────────────────

async function notifyClaimSuccess({ network, amount, txHash, explorer, wallet }) {
  const msg =
    `✅ <b>GoodDollar Claim Success</b>\n\n` +
    `🌐 <b>Network:</b> ${network}\n` +
    `💰 <b>Amount:</b> ${amount} G$\n` +
    `👛 <b>Wallet:</b> <code>${shortAddr(wallet)}</code>\n` +
    `🔗 <a href="${explorer}${txHash}">View Transaction</a>\n\n` +
    `⏰ Next claim in ~24 hours`;
  await sendMessage(msg);
}

async function notifyClaimFailed({ network, reason, wallet }) {
  const msg =
    `❌ <b>GoodDollar Claim Failed</b>\n\n` +
    `🌐 <b>Network:</b> ${network}\n` +
    `👛 <b>Wallet:</b> <code>${shortAddr(wallet)}</code>\n` +
    `⚠️ <b>Reason:</b> ${reason}`;
  await sendMessage(msg);
}

async function notifyAlreadyClaimed({ network, wallet }) {
  const msg =
    `ℹ️ <b>Already Claimed Today</b>\n\n` +
    `🌐 <b>Network:</b> ${network}\n` +
    `👛 <b>Wallet:</b> <code>${shortAddr(wallet)}</code>\n` +
    `⏳ Nothing to do — come back tomorrow!`;
  await sendMessage(msg);
}

async function notifyLowGas({ network, balance, symbol }) {
  const msg =
    `⛽ <b>Low Gas Warning</b>\n\n` +
    `🌐 <b>Network:</b> ${network}\n` +
    `💸 <b>Balance:</b> ${balance} ${symbol}\n\n` +
    `Please top up your wallet to continue auto-claiming!`;
  await sendMessage(msg);
}

async function notifyStartup(wallet) {
  const msg =
    `🚀 <b>GoodDollar Auto-Claimer Started</b>\n\n` +
    `👛 Wallet: <code>${shortAddr(wallet)}</code>\n` +
    `🌐 Networks: Celo + Fuse\n` +
    `⏰ Claims run daily at the scheduled time\n\n` +
    `Bot is live and watching! 👀`;
  await sendMessage(msg);
}

async function notifySummary(results) {
  const lines = results.map((r) => {
    if (r.status === "success")
      return `✅ ${r.network}: +${r.amount} G$ — <a href="${r.explorer}${r.txHash}">tx</a>`;
    if (r.status === "already_claimed") return `ℹ️ ${r.network}: already claimed`;
    return `❌ ${r.network}: ${r.reason}`;
  });

  const msg =
    `📊 <b>Daily Claim Summary</b>\n\n` +
    lines.join("\n") +
    `\n\n⏰ Next run in ~24 hours`;
  await sendMessage(msg);
}

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "unknown";
}

module.exports = {
  initBot,
  notifyClaimSuccess,
  notifyClaimFailed,
  notifyAlreadyClaimed,
  notifyLowGas,
  notifyStartup,
  notifySummary,
};
