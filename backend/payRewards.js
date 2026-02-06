import { query } from "./db.js";

// ⚠️ txHash ты вставляешь ПОСЛЕ реального TON send
async function markPaid(claimId, txHash) {
  await query(`
    UPDATE reward_event_claims
    SET
      status = 'PAID',
      tx_hash = $1,
      paid_at = NOW()
    WHERE id = $2
      AND status = 'PENDING'
  `, [txHash, claimId]);

  console.log("✅ Claim", claimId, "marked as PAID");
}

// пример запуска
(async () => {
  // 👇 id из reward_event_claims
  await markPaid(1, "TON_TX_HASH_HERE");
  process.exit(0);
})();
