import { query } from "./db.js";
import { autoSendNXN } from "./autoSendNXN.js";

let running = false;

export async function runAutoSendNXN() {
  if (running) return;
  running = true;

  try {
    const { rows } = await query(`
      SELECT id, ton_address, amount
      FROM reward_event_claims
      WHERE status = 'PENDING'
      ORDER BY id ASC
      LIMIT 1
    `);

    if (rows.length === 0) return;

    const claim = rows[0];

    console.log(
      `🚀 AutoSend NXN | claim=${claim.id} | amount=${claim.amount}`
    );

    await autoSendNXN({
      db: { query },
      claimId: claim.id,
      userTonAddress: claim.ton_address,
      amount: claim.amount,
    });

  } finally {
    running = false;
  }
}
