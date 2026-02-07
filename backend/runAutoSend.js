// backend/runAutoSend.js

import { query } from "./db.js";
import { autoSendNXN } from "./autoSendNXN.js";

export async function runAutoSendNXN() {
  console.log("🚀 runAutoSendNXN called");

  const res = await query(`
    SELECT id, wallet, reward_amount
    FROM reward_event_claims
    WHERE status = 'PENDING'
    ORDER BY id
    LIMIT 1
  `);

  if (res.rows.length === 0) {
    console.log("ℹ️ No pending claims");
    return;
  }

  const claim = res.rows[0];

  console.log(
    "📦 CLAIM FROM DB:",
    claim.id,
    claim.wallet,
    claim.reward_amount
  );

  // ❗ ОБРАТИ ВНИМАНИЕ
  await autoSendNXN({
    claimId: claim.id,
    wallet: claim.wallet,           // ← ВАЖНО
    amount: claim.reward_amount,
  });
}
