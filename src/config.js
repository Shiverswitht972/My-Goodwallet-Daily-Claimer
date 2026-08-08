// src/config.js
// ─── Network & Contract Configuration ────────────────────────────────────────

const NETWORKS = {
  celo: {
    name: "Celo",
    chainId: 42220,
    rpcUrl: process.env.CELO_RPC_URL || "https://forno.celo.org",
    ubiContract: "0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1",
    symbol: "CELO",
    explorer: "https://celoscan.io/tx/",
  },
  fuse: {
    name: "Fuse",
    chainId: 122,
    rpcUrl: process.env.FUSE_RPC_URL || "https://rpc.fuse.io",
    ubiContract: "0xd253A5203817225e9768C05E5996d642fb96bA86",
    symbol: "FUSE",
    explorer: "https://explorer.fuse.io/tx/",
  },
  xdc: {
    name: "XDC",
    chainId: 50,
    rpcUrl: process.env.XDC_RPC_URL || "https://erpc.xdcrpc.com",
    ubiContract: "0x22867567E2D80f2049200E25C6F31CB6Ec2F0faf",
    symbol: "XDC",
    explorer: "https://xdcscan.com/tx/",
  },
};

// Minimal ABI for GoodDollar UBIScheme contract
const UBI_ABI = [
  // Check how much G$ this address can claim (0 = not eligible or already claimed)
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "checkEntitlement",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Perform the claim
  {
    inputs: [],
    name: "claim",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Check when the current UBI period started
  {
    inputs: [],
    name: "periodStart",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Get last claim day for an account
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "lastClaimed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

module.exports = { NETWORKS, UBI_ABI };
