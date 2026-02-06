import TonWeb from "tonweb";
import { query } from "./db.js";

const TON_RPC = "https://toncenter.com/api/v2/jsonRPC";
const API_KEY = process.env.TON_API_KEY;

const tonweb = new TonWeb(
  new TonWeb.HttpProvider(TON_RPC, { apiKey: API_KEY })
);

// 🔐 КОШЕЛЁК АДМИНА
const ADMIN_WALLET = TonWeb.utils.Address.parse(
  process.env.TON_ADMIN_WALLET
);

const ADMIN_KEY = TonWeb.utils.hexToBytes(
  process.env.TON_ADMIN_PRIVATE_KEY
);

export async function runTonAutoSend() {
  const res = await query(`
    SELECT *
    FROM reward_event_claims
    WHERE status = 'PENDING'
    ORDER BY created_at
    LIMIT 1
  `);

  if (res.rowCount === 0) return;

  const claim = res.rows[0];

  try {
    const amountNano =
      TonWeb.utils.toNano(claim.reward_amount);

    const wallet = tonweb.wallet.create({
      publicKey: ADMIN_KEY.slice(32),
      wc: 0
    });

    const seqno = await wallet.methods.seqno().call();

    const transfer = wallet.methods.transfer({
      secretKey: ADMIN_KEY,
      toAddress: claim.wallet,
      amount: amountNano,
      seqno,
      payload: "NXN Reward",
      sendMode: 3
    });

    await transfer.send();

    await query(`
      UPDATE reward_event_claims
      SET status = 'PAID',
          paid_at = NOW(),
          tx_hash = $1
      WHERE id = $2
    `, [`auto_${Date.now()}`, claim.id]);

    console.log("✅ PAID", claim.telegram_id);

  } catch (err) {
    console.error("TON SEND ERROR:", err.message);
  }
}
