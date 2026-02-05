import { query } from "./db.js";

// usage:
// node payRewards.js <claim_id> <tx_hash>

const [, , claimId, txHash] = process.argv;

if (!claimId || !txHash) {
  console.log("Usage: node payRewards.js <claim_id> <tx_hash>");
  process.exit(1);
}

(async () => {
  const res = await query(`
    SELECT *
    FROM reward_claims
    WHERE id = $1
  `, [claimId]);

  if (res.rowCount === 0) {
    console.log("❌ Claim not found");
    process.exit(1);
  }

  const claim = res.rows[0];

  if (claim.status !== "PENDING") {
    console.log("❌ Claim is not PENDING");
    process.exit(1);
  }

  await query(`
    UPDATE reward_claims
    SET
      status = 'PAID',
      tx_hash = $1,
      paid_at = NOW()
    WHERE id = $2
  `, [txHash, claimId]);

  console.log("✅ Reward marked as PAID");
  process.exit(0);
})();
