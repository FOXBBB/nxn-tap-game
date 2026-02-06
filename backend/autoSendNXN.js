import { query } from "./db.js";
import { keyPairFromSecretKey } from "@ton/crypto";
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, beginCell } from "@ton/core";
import dotenv from "dotenv";

dotenv.config();

const JETTON_MASTER = process.env.NXN_JETTON_MASTER;
const DECIMALS = Number(process.env.NXN_DECIMALS || 3);
const PRIVATE_KEY_HEX = process.env.TON_ADMIN_PRIVATE_KEY;

if (!JETTON_MASTER || !PRIVATE_KEY_HEX) {
  throw new Error("TON ENV VARS NOT SET");
}

const secretKey = Buffer.from(PRIVATE_KEY_HEX, "hex");
const keyPair = keyPairFromSecretKey(secretKey);

async function sendJetton({ to, amount }) {
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  const walletContract = client.open(wallet);

  const toAddress = Address.parse(to);
  const jettonMaster = Address.parse(JETTON_MASTER);

  const jettonAmount = BigInt(amount) * BigInt(10 ** DECIMALS);

  // Jetton transfer payload
  const body = beginCell()
    .storeUint(0xf8a7ea5, 32) // jetton transfer op
    .storeUint(0, 64)        // query id
    .storeCoins(jettonAmount)
    .storeAddress(toAddress)
    .storeAddress(wallet.address)
    .storeBit(0)             // no custom payload
    .storeCoins(0)
    .storeBit(0)
    .endCell();

  const seqno = await walletContract.getSeqno();

  await walletContract.sendTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [
      internal({
        to: jettonMaster,
        value: "0.05",
        body,
      }),
    ],
  });

  return seqno;
}

export async function runAutoSendNXN() {
  const pending = await query(`
    SELECT id, wallet, reward_amount
    FROM reward_event_claims
    WHERE status = 'PENDING'
    ORDER BY created_at
    LIMIT 3
  `);

  for (const c of pending.rows) {
    try {
      console.log("🚀 Sending NXN");
      console.log("➡️ Wallet:", c.wallet);
      console.log("➡️ Amount:", c.reward_amount);

      const tx = await sendJetton({
        to: c.wallet,
        amount: c.reward_amount,
      });

      await query(
        `UPDATE reward_event_claims
         SET status='PAID', paid_at=NOW(), tx_hash=$1
         WHERE id=$2`,
        [String(tx), c.id]
      );

      console.log("✅ PAID", c.wallet);
    } catch (e) {
      console.error("❌ SEND FAILED", e.message);
    }
  }
}
