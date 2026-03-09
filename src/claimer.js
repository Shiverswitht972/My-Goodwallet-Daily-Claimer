// src/claimer.js
// ─── GoodDollar UBI Claimer ───────────────────────────────────────────────────

const { ethers } = require("ethers");
const { NETWORKS, UBI_ABI } = require("./config");
const tg = require("./telegram");

const MIN_GAS_BALANCE = ethers.utils.parseEther("0.001"); // warn if below this

// ─── Single Network Claim ─────────────────────────────────────────────────────

async function claimOnNetwork(networkKey, wallet) {
  const net = NETWORKS[networkKey];
  console.log(`\n[${net.name}] Starting claim attempt...`);

  let provider;
  try {
    provider = new ethers.providers.JsonRpcProvider(net.rpcUrl, {
      chainId: net.chainId,
      name: net.name.toLowerCase(),
    });
    await provider.getBlockNumber(); // connectivity check
  } catch (err) {
    const reason = `RPC connection failed: ${err.message}`;
    console.error(`[${net.name}] ❌ ${reason}`);
    await tg.notifyClaimFailed({ network: net.name, reason, wallet: wallet.address });
    return { network: net.name, status: "failed", reason };
  }

  // Connect wallet to this network
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(net.ubiContract, UBI_ABI, signer);

  // ── Gas balance check ────────────────────────────────────────────────────────
  let gasBalance;
  try {
    gasBalance = await provider.getBalance(wallet.address);
    const formatted = ethers.utils.formatEther(gasBalance);
    console.log(`[${net.name}] Gas balance: ${formatted} ${net.symbol}`);

    if (gasBalance.lt(MIN_GAS_BALANCE)) {
      await tg.notifyLowGas({
        network: net.name,
        balance: formatted,
        symbol: net.symbol,
      });
      // Still try to claim — tx might succeed if gas is ultra-cheap
    }
  } catch (err) {
    console.warn(`[${net.name}] ⚠️  Could not check gas balance: ${err.message}`);
  }

  // ── Check entitlement ────────────────────────────────────────────────────────
  let entitlement;
  try {
    entitlement = await contract.checkEntitlement(wallet.address);
    console.log(
      `[${net.name}] Entitlement: ${ethers.utils.formatUnits(entitlement, 2)} G$`
    );
  } catch (err) {
    console.warn(`[${net.name}] ⚠️  checkEntitlement failed, trying claim anyway: ${err.message}`);
    entitlement = ethers.BigNumber.from(1); // assume eligible
  }

  if (entitlement.eq(0)) {
    console.log(`[${net.name}] ℹ️  Already claimed today, nothing to do.`);
    await tg.notifyAlreadyClaimed({ network: net.name, wallet: wallet.address });
    return { network: net.name, status: "already_claimed" };
  }

  // ── Execute claim ─────────────────────────────────────────────────────────────
  try {
    console.log(`[${net.name}] 📤 Sending claim transaction...`);

    const gasEstimate = await contract.estimateGas.claim().catch(() => {
      return ethers.BigNumber.from(200000); // fallback gas limit
    });

    const gasLimit = gasEstimate.mul(120).div(100); // +20% buffer
    const feeData = await provider.getFeeData();

    const txOptions = { gasLimit };
    // Use EIP-1559 if supported, otherwise legacy
    if (feeData.maxFeePerGas) {
      txOptions.maxFeePerGas = feeData.maxFeePerGas;
      txOptions.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    } else if (feeData.gasPrice) {
      txOptions.gasPrice = feeData.gasPrice;
    }

    const tx = await contract.claim(txOptions);
    console.log(`[${net.name}] ⏳ Tx sent: ${tx.hash} — waiting for confirmation...`);

    const receipt = await tx.wait(2); // wait 2 confirmations

    if (receipt.status === 1) {
      const amount = ethers.utils.formatUnits(entitlement, 2);
      console.log(`[${net.name}] ✅ Claim confirmed! Amount: ${amount} G$`);

      await tg.notifyClaimSuccess({
        network: net.name,
        amount,
        txHash: tx.hash,
        explorer: net.explorer,
        wallet: wallet.address,
      });

      return {
        network: net.name,
        status: "success",
        amount,
        txHash: tx.hash,
        explorer: net.explorer,
      };
    } else {
      throw new Error("Transaction reverted (status 0)");
    }
  } catch (err) {
    const reason = parseError(err);
    console.error(`[${net.name}] ❌ Claim failed: ${reason}`);

    await tg.notifyClaimFailed({
      network: net.name,
      reason,
      wallet: wallet.address,
    });

    return { network: net.name, status: "failed", reason };
  }
}

// ─── Claim on All Networks ────────────────────────────────────────────────────

async function claimAll() {
  console.log("\n═══════════════════════════════════════════");
  console.log(`  GoodDollar Auto-Claim  —  ${new Date().toISOString()}`);
  console.log("═══════════════════════════════════════════");

  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ WALLET_PRIVATE_KEY not set in .env");
    process.exit(1);
  }

  // Single wallet works across both networks
  const wallet = new ethers.Wallet(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`);
  console.log(`\n👛 Wallet: ${wallet.address}`);

  const enabledNetworks = [];
  if (process.env.ENABLE_CELO !== "false") enabledNetworks.push("celo");
  if (process.env.ENABLE_FUSE !== "false") enabledNetworks.push("fuse");

  if (enabledNetworks.length === 0) {
    console.warn("⚠️  No networks enabled. Set ENABLE_CELO/ENABLE_FUSE in .env");
    return;
  }

  // Run claims (sequentially to avoid nonce conflicts on same address)
  const results = [];
  for (const networkKey of enabledNetworks) {
    const result = await claimOnNetwork(networkKey, wallet);
    results.push(result);
    // Brief pause between networks
    if (enabledNetworks.indexOf(networkKey) < enabledNetworks.length - 1) {
      await sleep(3000);
    }
  }

  // Send daily summary to Telegram
  await tg.notifySummary(results);

  console.log("\n✅ All done for today!\n");
  return results;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseError(err) {
  if (err.reason) return err.reason;
  if (err.error?.message) return err.error.message;
  if (err.message) {
    // Trim long ethers error messages
    const msg = err.message.substring(0, 200);
    return msg;
  }
  return "Unknown error";
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { claimAll };
