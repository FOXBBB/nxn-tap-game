import { query } from "./db.js";
import dotenv from "dotenv";

import { TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { Address, toNano } from "@ton/core";
import { JettonMaster } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

dotenv.config();

/* ================= ENV ================= */

const JETTON_MASTER = process.env.NXN_JETTON_MASTER; // EQ...
const DECIMALS = Number(process.env.NXN_DECIMALS || 3);
const ADMIN_PRIVATE_KEY = process.env.TON_ADMIN_PRIVATE_KEY; // hex
const ADMIN_WALLET = process.env.TON_ADMIN_WALLET; // UQ...

if (!JETTON_MASTER || !ADMIN_PRIVATE_KEY || !ADMIN_WALLET) {
  throw new Error("❌ TON ENV VARS NOT SET");
}

/* ================= TON SETUP ================= */

const secretKey = Buffer.from(ADMIN_PRIVATE_KEY, "hex");
const publicKey = secretKey.slice(32);

/* ================= SEND JETTON ================= */

async function sendJetton(toAddress, amount) {
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });

  // admin TON wallet
  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey,
  });
  const walletContract = client.open(wallet);

  // jetton master
  const jettonMaster = client.open(
    JettonMaster.create(Address.parse(JETTON_MASTER))
  );

  // admin jetton wallet
  const adminJettonWalletAddress =
    await jettonMaster.getWalletAddress(wallet.address);

  const adminJettonWallet =
    client.openJettonWallet(adminJettonWalletAddress);

  const jettonAmount =
    BigInt(amount) * BigInt(10 ** DECIMALS);

  const seqno = await walletContract.getSeqno();

  console.log("🟡 SEND JETTON");
  console.log("➡️ TO:", toAddress);
  console.log("➡️ AMOUNT:", amount);

  await adminJettonWallet.sendTransfer(
    walletContract.sender(secretKey),
    toNano("0.05"), // TON fee
    jettonAmount,
    Address.parse(toAddress),
    wallet.address,
    null,
    toNano("0.02"),
    null
  );

  // ждём подтверждение seqno
  while ((await walletContract.getSeqno()) === seqno) {
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log("✅ JETTON SENT");
}

/* ================= AUTOSEND LOOP ================= */

export async function runAutoSendNXN() {
  const pending = await query(`
    SELECT id, wallet, reward_amount
    FROM reward_event_claims
    WHERE status = 'PENDING'
    ORDER BY created_at
    LIMIT 1
  `);

  if (pending.rowCount === 0) return;

  for (const c of pending.rows) {
    try {
      console.log("🚀 CLAIM ID:", c.id);

      await sendJetton(c.wallet, c.reward_amount);

      await query(`
        UPDATE reward_event_claims
        SET
          status = 'PAID',
          paid_at = NOW()
        WHERE id = $1
      `, [c.id]);

      console.log("✅ CLAIM PAID:", c.id);

    } catch (e) {
      console.error("❌ SEND FAILED:", e);

      await query(`
        UPDATE reward_event_claims
        SET status = 'ERROR'
        WHERE id = $1
      `, [c.id]);
    }
  }
}
