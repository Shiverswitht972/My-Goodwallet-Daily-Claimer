# 🪙 GoodDollar Auto-Claimer — Setup Guide
### For people who have never touched code in their life

This tool automatically collects your free daily G$ (GoodDollar) on both Celo and Fuse every single day — without you doing anything after setup. It runs on GitHub's free servers. No laptop needs to be on. No app to keep open.

**Total setup time: about 15 minutes.**

---

## Before You Start — Checklist

Make sure you have these ready:

- [ ] A **GoodDollar account** that has completed face verification at [gooddollar.org](https://gooddollar.org)
- [ ] Your **wallet private key** (instructions below on how to get it)
- [ ] A **GitHub account** — free at [github.com](https://github.com)
- [ ] A **Telegram account** (optional but recommended — you'll get a message every time it claims)

---

## Step 1 — Get Your Wallet Private Key

> ⚠️ Your private key is like the master password to your wallet. Never share it with anyone except tools you set up yourself. This tool stores it encrypted in GitHub — it is never visible to anyone.

**If you use MetaMask:**

1. Open MetaMask on your phone or browser
2. Tap the three dots (⋮) next to your account name
3. Tap **Account Details**
4. Tap **Export Private Key**
5. Enter your MetaMask password
6. Copy the long string of letters and numbers — that is your private key

Save it somewhere temporarily (like your notes app). You will paste it in Step 4.

---

## Step 2 — Fork the Repo

"Forking" means making your own personal copy of the tool on GitHub.

1. Go to: **[https://github.com/Shiverswitht972/My-Goodwallet-Daily-Claimer]**  
2. Click the **Fork** button in the top right corner
3. Leave all settings as default and click **Create fork**

You now have your own copy. Everything from here happens inside your copy.

---

## Step 3 — Set Up Telegram Notifications (Optional but Recommended)

This sends you a message every time a claim succeeds or fails.

**Create a Telegram bot:**

1. Open Telegram and search for **@BotFather**
2. Tap **Start**
3. Type `/newbot` and send it
4. It will ask for a name — type anything, e.g. `My GoodDollar Bot`
5. It will ask for a username — type anything ending in `bot`, e.g. `mygooddollar_bot`
6. BotFather will give you a **token** — a long string like `7412638901:AAFx9k...` — copy it

**Get your Chat ID:**

1. Search for your new bot in Telegram and tap **Start**
2. Open this link in your browser (replace YOUR_TOKEN with the token you just copied):  
   `https://api.telegram.org/botYOUR_TOKEN/getUpdates`
3. You will see some text. Look for `"chat":{"id":` followed by a number — that number is your **Chat ID**

Save both values. You will paste them in the next step.

---

## Step 4 — Add Your Secrets to GitHub

Secrets are encrypted. GitHub never shows them to anyone — not even you after saving.

1. Go to your forked repo on GitHub
2. Click **Settings** (top menu of your repo)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** and add each one below:

| Name | Value |
|------|-------|
| `WALLET_PRIVATE_KEY` | Your private key from Step 1 |
| `TELEGRAM_BOT_TOKEN` | Your bot token from Step 3 |
| `TELEGRAM_CHAT_ID` | Your chat ID from Step 3 |

For each one: type the name exactly as shown, paste your value, click **Add secret**.

> If you skipped Telegram, only add `WALLET_PRIVATE_KEY`. The tool works without Telegram — you just won't get notifications.

---

## Step 5 — Enable GitHub Actions

1. In your repo, click the **Actions** tab (top menu)
2. If you see a yellow banner saying workflows are disabled, click **I understand my workflows, go ahead and enable them**

That's it. The tool will now run automatically every night at midnight Lagos time.

---

## Step 6 — Do a Test Run First

Before trusting it to run on its own, let's confirm it works.

1. Click the **Actions** tab
2. In the left sidebar, click **GoodDollar Daily Claimer**
3. Click the **Run workflow** button (grey button on the right)
4. A small dropdown appears — click the green **Run workflow** button inside it
5. Wait about 30 seconds, then refresh the page
6. You should see a new run appear. Click on it, then click **claim** to see the logs

**If you see green checkmarks** — everything is working. You're done!

**If you see a red X** — scroll down in the logs and copy the error message. Send it to your friend who shared this tool with you.

---

## You're Done 🎉

The tool will now:
- Run automatically every night at midnight Lagos time
- Claim G$ on both Celo and Fuse networks
- Send you a Telegram message confirming the claim (if you set it up)
- Skip quietly if already claimed or not eligible yet

You don't need to do anything else.

---

## Common Problems

**"Already claimed today"**  
Normal. You or the tool already claimed for today. It will try again tomorrow.

**No Telegram message came**  
Check that your bot token and chat ID are correct in your GitHub secrets. Also make sure you started a conversation with your bot in Telegram (search for it and tap Start).

**Red X in the workflow logs**  
Check that your `WALLET_PRIVATE_KEY` secret is correct and that your wallet has completed GoodDollar face verification. If unsure, send the error log to the person who shared this tool with you.

**"Workflow not running on schedule"**  
GitHub pauses scheduled workflows if your repo has had no activity for 60 days. You will receive an email asking if you want to keep it running — just click yes.

---

## Important Reminders

- Never share your private key with anyone
- Never screenshot your private key
- This tool does not store your key anywhere other than your own GitHub secrets
- You can delete the secret from GitHub at any time under Settings → Secrets

---

*Need help? Send your workflow log screenshot to the person who shared this tool with you.*
