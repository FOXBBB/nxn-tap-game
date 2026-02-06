import { query } from "./db.js";
import { autoSendNXN } from "./autoSendNXN.js";

let running = false;

export async function runAutoSendNXN() {
  if (running) return;
  running = true;

  try {
    const { rows } = await query(`
      SELECT
        id,
        wallet,
        reward_amount
      FROM reward_event_claims
      WHERE status = 'PENDING'
      ORDER BY id ASC
      LIMIT 1
    `);

    if (rows.length === 0) return;

    const claim = rows[0];

    console.log(
      `🚀 AutoSend NXN | claim=${claim.id} | amount=${claim.reward_amount} | to=${claim.wallet}`
    );

    await autoSendNXN({
      db: { query },
      claimId: claim.id,
      userTonAddress: claim.wallet,
      amount: claim.reward_amount,
    });

  } catch (err) {
    console.error("AutoSend error:", err);
  } finally {
    running = false;
  }
}
