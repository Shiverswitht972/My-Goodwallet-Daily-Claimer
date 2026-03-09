# 🪙 GoodDollar Auto-Claimer Bot

Auto-claims your GoodDollar (G$) UBI every 24 hours on **Celo** and **Fuse** networks, and notifies you via **Telegram** whether each claim succeeded or failed.

---

## Features

- ✅ Claims on both Celo and Fuse networks daily
- ⛽ Gas balance warning before each claim
- ℹ️ Skips gracefully if already claimed today
- 📣 Telegram notifications: success / failure / already claimed / low gas
- 📊 Daily summary message with all network results
- ⏰ Fully configurable cron schedule (UTC)
- 🚀 Deploy-ready for Railway, Render, or any Node.js host

---

## Prerequisites

- A **GoodDollar-verified wallet** (face-verified via GoodWallet)
- Some **CELO** on Celo network for gas (~0.01 CELO is plenty)
- Some **FUSE** on Fuse network for gas (~0.01 FUSE is plenty)
- A **Telegram bot token** (from @BotFather)

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd gooddollar-claimer
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Required | Description |
|---|---|---|
| `WALLET_PRIVATE_KEY` | ✅ | Your GoodDollar wallet private key |
| `TELEGRAM_BOT_TOKEN` | ✅ | From @BotFather on Telegram |
| `TELEGRAM_CHAT_ID` | ✅ | Your Telegram user/chat ID |
| `ENABLE_CELO` | optional | `true` / `false` (default: true) |
| `ENABLE_FUSE` | optional | `true` / `false` (default: true) |
| `CRON_SCHEDULE` | optional | Cron string, UTC (default: `0 9 * * *`) |
| `CLAIM_ON_START` | optional | Run a claim immediately on startup |

### 3. Get your Telegram Chat ID

1. Create a bot via [@BotFather](https://t.me/BotFather) → `/newbot`
2. Copy the bot token into `.env`
3. Send any message to your new bot
4. Open: `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Find `"chat":{"id": 123456789}` — that number is your `TELEGRAM_CHAT_ID`

### 4. Run locally

```bash
npm start
```

---

## Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select your repo
4. Go to **Variables** and add all your `.env` values
5. Railway will auto-detect `npm start` and keep it running 24/7

**That's it.** Railway will restart the bot automatically if it crashes.

---

## Deploy to Render

1. Push repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Background Worker**
3. Connect your repo, set **Build Command** to `npm install`, **Start Command** to `npm start`
4. Add environment variables in the Render dashboard
5. Deploy!

---

## Telegram Notification Examples

| Event | Message |
|---|---|
| Claim success | ✅ Celo: +12.5 G$ — tx link |
| Claim failed | ❌ Fuse: Transaction reverted |
| Already claimed | ℹ️ Celo: already claimed today |
| Low gas | ⛽ Fuse balance: 0.0003 FUSE — top up! |
| Daily summary | 📊 Celo ✅ Fuse ✅ — next run in ~24hrs |

---

## Project Structure

```
gooddollar-claimer/
├── src/
│   ├── index.js      # Entry point + cron scheduler
│   ├── claimer.js    # Claim logic for Celo & Fuse
│   ├── telegram.js   # Telegram notification helpers
│   └── config.js     # Network config + contract ABI
├── .env.example      # Copy to .env and fill in
├── .gitignore
└── package.json
```

---

## Security Notes

- ⚠️ **Never commit your `.env` file** — it contains your private key
- Use Railway/Render **environment variables** instead of uploading `.env`
- Your wallet only needs small gas amounts — keep minimal balances
- This bot only calls the `claim()` function — it cannot transfer your G$

---

## Troubleshooting

**Claim fails with "not whitelisted"**  
→ Make sure your wallet address has been face-verified on GoodWallet.

**No Telegram messages**  
→ Check your bot token and chat ID. Make sure you've sent at least one message to the bot first.

**"already claimed" every run**  
→ Someone/something else already claimed. The bot will try again tomorrow.

**Low gas on Fuse**  
→ Bridge or buy a small amount of FUSE. Even 0.01 FUSE covers hundreds of claim txs.
