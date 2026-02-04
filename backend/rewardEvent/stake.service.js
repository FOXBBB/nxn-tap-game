const db = require('../db')
const { STAKE, STATES } = require('./constants')
const { getActiveCycle } = require('./stateMachine')

async function stakeNXN(telegramId, amount) {
  const cycle = await getActiveCycle()

  if (!cycle || cycle.state !== STATES.STAKE_ACTIVE)
    throw new Error('Stake is not active')

  if (amount < STAKE.MIN || amount > STAKE.MAX)
    throw new Error('Invalid stake amount')

  const existing = await db.query(
    `SELECT * FROM reward_event_stakes
     WHERE cycle_id=$1 AND telegram_id=$2`,
    [cycle.id, telegramId]
  )

  if (existing.rows.length) {
    const last = new Date(existing.rows[0].last_updated)
    if (Date.now() - last.getTime() < STAKE.COOLDOWN_MS)
      throw new Error('Cooldown')
  }

  // ⚠️ ИСПОЛЬЗУЙ ТВОЮ СУЩЕСТВУЮЩУЮ ФУНКЦИЮ
  await deductNXNBalance(telegramId, amount)

  await db.query(`
    INSERT INTO reward_event_stakes
    (cycle_id, telegram_id, stake_amount, last_updated)
    VALUES ($1,$2,$3,NOW())
    ON CONFLICT (cycle_id, telegram_id)
    DO UPDATE SET stake_amount=$3, last_updated=NOW()
  `, [cycle.id, telegramId, amount])
}

module.exports = { stakeNXN }
