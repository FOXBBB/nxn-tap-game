import { query } from "./db.js";
import { autoSendNXN } from "./autoSendNXN.js";

/**
 * Обрабатывает все PENDING reward claims:
 *  - отправляет NXN jetton
 *  - после успеха ставит PAID
 */
async function processPendingClaims() {
  const { rows: claims } = await query(`
    SELECT
      id,
      ton_address,
      amount
    FROM reward_event_claims
    WHERE status = 'PENDING'
    ORDER BY id ASC
  `);

  if (claims.length === 0) {
    console.log("ℹ️ No PENDING claims");
    return;
  }

  for (const claim of claims) {
    try {
      console.log(
        `🚀 Sending NXN | claim=${claim.id} | amount=${claim.amount} | to=${claim.ton_address}`
      );

      // ⬇️ РЕАЛЬНАЯ ОТПРАВКА JETTON
      const txHash = await autoSendNXN({
        db: { query },
        claimId: claim.id,
        userTonAddress: claim.ton_address,
        amount: claim.amount,
      });

      console.log(`✅ Claim ${claim.id} paid, tx=${txHash}`);
    } catch (err) {
      console.error(`❌ Failed claim ${claim.id}`, err.message);
    }
  }
}

/**
 * Запуск из консоли:
 * node payRewards.js
 */
(async () => {
  try {
    await processPendingClaims();
  } catch (e) {
    console.error("🔥 Fatal error:", e);
  } finally {
    process.exit(0);
  }
})();
