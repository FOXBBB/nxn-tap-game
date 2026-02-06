import { query } from "./db.js";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address } from "@ton/core";
import dotenv from "dotenv";

dotenv.config();

const JETTON_MASTER = process.env.NXN_JETTON_MASTER;
const DECIMALS = Number(process.env.NXN_DECIMALS || 3);
const PRIVATE_KEY_HEX = process.env.TON_ADMIN_PRIVATE_KEY;

if (!JETTON_MASTER || !PRIVATE_KEY_HEX) {
  throw new Error("❌ TON ENV VARS NOT SET");
}

const privateKey = Buffer.from(PRIVATE_KEY_HEX, "hex");

async function sendJetton({ to, amount }) {
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: privateKey.slice(32),
  });

  const walletContract = client.open(wallet);

  const jettonMaster = Address.parse(JETTON_MASTER);
  const toAddress = Address.parse(to);

  const jettonAmount = BigInt(amount) * BigInt(10 ** DECIMALS);

  const body = internal({
    value: "0.05",
    bounce: true,
    body: {
      type: "transfer",
      queryId: Date.now(),
      amount: jettonAmount,
      destination: toAddress,
      responseDestination: wallet.address,
      forwardTonAmount: "0.02",
      forwardPayload: null,
    },
  });

  const seqno = await walletContract.getSeqno();

  await walletContract.sendTransfer({
    seqno,
    secretKey: privateKey,
    messages: [body],
  });

  return seqno;
}

export async function runAutoSendNXN() {
  const pending = await query(`
    SELECT id, telegram_id, wallet, reward_amount
    FROM reward_event_claims
    WHERE status = 'PENDING'
    ORDER BY created_at
    LIMIT 3
  `);

  if (pending.rowCount === 0) return;

  for (const c of pending.rows) {
    try {
      console.log("🚀 Sending NXN to", c.wallet);
      console.log("🧪 CLAIM ROW:", claim);
      console.log("🧪 WALLET VALUE:", claim.wallet, typeof claim.wallet);

      const tx = await sendJetton({
        to: claim.wallet,          // UQ...
        amount: rewardAmount,      // в jetton units
      });

      await query(`
        UPDATE reward_event_claims
        SET
          status = 'PAID',
          paid_at = NOW(),
          tx_hash = $1
        WHERE id = $2
      `, [String(tx), c.id]);

      console.log("✅ PAID:", c.wallet);

    } catch (e) {
      console.error("❌ SEND FAILED", e);
    }
  }
}
