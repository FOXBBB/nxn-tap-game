import db from "../db.js";

export async function getTop100(cycleId) {
  const res = await db.query(`
    SELECT telegram_id, stake_amount
    FROM reward_event_stakes
    WHERE cycle_id=$1
    ORDER BY stake_amount DESC
    LIMIT 100
  `, [cycleId]);

  const max = res.rows[0]?.stake_amount || 1;

  return res.rows.map((u, i) => ({
    rank: i + 1,
    telegram_id: u.telegram_id,
    relative: u.stake_amount / max,
  }));
}

export async function getUserPosition(cycleId, telegramId) {
  const res = await db.query(`
    SELECT COUNT(*) + 1 AS position
    FROM reward_event_stakes
    WHERE cycle_id=$1 AND stake_amount >
      (SELECT stake_amount FROM reward_event_stakes
       WHERE telegram_id=$2 AND cycle_id=$1)
  `, [cycleId, telegramId]);

  const pos = Number(res.rows[0].position);
  return {
    position: pos,
    eligible: pos <= 500,
  };
}
