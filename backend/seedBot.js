import { query } from "./db.js";

async function createBot() {
  await query(`
    INSERT INTO users (
      telegram_id,
      name,
      avatar,
      balance,
      energy,
      max_energy,
      tap_power,
      reward_stake,
      is_bot,
      bot_tier,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
    ON CONFLICT (telegram_id) DO NOTHING
  `, [
    "bot_1",
    "kirillRm",
    null,
    15000,
    100,
    100,
    5,
    0,
    true,
    "active"
  ]);

  console.log("Bot created");
  process.exit();
}

createBot();

