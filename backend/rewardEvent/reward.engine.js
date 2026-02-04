import db from "../db.js";
import { TIERS, REWARD } from "./constants.js";

export async function calculateRewards(cycleId) {
  const stakes = await db.query(`
    SELECT telegram_id
    FROM reward_event_stakes
    WHERE cycle_id=$1
    ORDER BY stake_amount DESC
    LIMIT 500
  `, [cycleId]);

  let rank = 1;

  for (const u of stakes.rows) {
    const tier = TIERS.find(t => rank >= t.from && rank <= t.to);
    if (!tier) continue;

    await db.query(`
      INSERT INTO reward_event_rewards
      (cycle_id, telegram_id, rank, reward_amount)
      VALUES ($1,$2,$3,$4)
    `, [cycleId, u.telegram_id, rank, tier.reward]);

    rank++;
  }

  const carry = REWARD.BASE_POOL - REWARD.DISTRIBUTED;

  await db.query(`
    UPDATE reward_event_cycles
    SET carry_over_pool = carry_over_pool + $1
    WHERE id=$2
  `, [carry, cycleId]);
}

export async function resetCycle(cycleId) {
  await db.query(
    "DELETE FROM reward_event_stakes WHERE cycle_id=$1",
    [cycleId]
  );
}

export async function createNewCycle() {
  const now = new Date();
  const stakeEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const claimEnd = new Date(stakeEnd.getTime() + 3 * 24 * 60 * 60 * 1000);

  await db.query(`
    INSERT INTO reward_event_cycles
    (state, stake_start, stake_end, claim_end)
    VALUES ('STAKE_ACTIVE',$1,$2,$3)
  `, [now, stakeEnd, claimEnd]);
}
