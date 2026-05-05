import { query } from "./db.js";

const BOT_PLAYERS = [
  ["900000001", "NovaX", "aggressive", "https://i.pravatar.cc/150?img=11"],
  ["900000002", "Blaze", "aggressive", "https://i.pravatar.cc/150?img=12"],
  ["900000003", "Razor", "aggressive", "https://i.pravatar.cc/150?img=13"],
  ["900000004", "Storm", "aggressive", "https://i.pravatar.cc/150?img=14"],
  ["900000005", "Vortex", "aggressive", "https://i.pravatar.cc/150?img=15"],
  ["900000006", "Phantom", "aggressive", "https://i.pravatar.cc/150?img=16"],

  ["900000007", "Axel", "medium", "https://i.pravatar.cc/150?img=21"],
  ["900000008", "Maverick", "medium", "https://i.pravatar.cc/150?img=22"],
  ["900000009", "Orion", "medium", "https://i.pravatar.cc/150?img=23"],
  ["900000010", "Titan", "medium", "https://i.pravatar.cc/150?img=24"],
  ["900000011", "Zero", "medium", null],
  ["900000012", "Vector", "medium", null],
  ["900000013", "Shadow", "medium", null],

  ["900000014", "Echo", "neutral", "https://i.pravatar.cc/150?img=31"],
  ["900000015", "Drift", "neutral", "https://i.pravatar.cc/150?img=32"],
  ["900000016", "Pulse", "neutral", "https://i.pravatar.cc/150?img=33"],
  ["900000017", "Neo", "neutral", null],
  ["900000018", "Ares", "neutral", null],
  ["900000019", "Onyx", "neutral", null],
  ["900000020", "Kai", "neutral", null],
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextDelayMinutes(type) {
  if (type === "aggressive") return randomInt(55, 75);
  if (type === "medium") return randomInt(120, 180);
  return randomInt(290, 330);
}

async function getCurrentRewardCycle() {
  const res = await query(`
    SELECT *
    FROM reward_event_cycles
    ORDER BY id DESC
    LIMIT 1
  `);

  if (res.rowCount === 0) return null;

  const c = res.rows[0];
  const now = new Date();

  if (now >= new Date(c.start_at) && now <= new Date(c.stake_end_at)) {
    return { id: c.id, state: "STAKE_ACTIVE" };
  }

  if (now > new Date(c.stake_end_at) && now <= new Date(c.claim_end_at)) {
    return { id: c.id, state: "CLAIM_ACTIVE" };
  }

  return { id: c.id, state: null };
}

async function ensureBotColumns() {
  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS bot_type TEXT,
    ADD COLUMN IF NOT EXISTS bot_next_action_at TIMESTAMP
  `);
}

async function ensureBotPlayers() {
  await ensureBotColumns();

  for (const [telegramId, name, type, avatar] of BOT_PLAYERS) {
    await query(
      `
      INSERT INTO users (
        telegram_id,
        name,
        avatar,
        balance,
        energy,
        max_energy,
        tap_power,
        is_bot,
        bot_type,
        bot_next_action_at,
        last_seen,
        last_energy_update
      )
      VALUES (
        $1::text,
        $2,
        $3,
        $4,
        100,
        100,
        1,
        true,
        $5,
        NOW() + ($6 || ' minutes')::interval,
        NOW(),
        NOW()
      )
      ON CONFLICT (telegram_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        is_bot = true,
        bot_type = EXCLUDED.bot_type
      `,
      [
        telegramId,
        name,
        avatar || "",
        randomInt(30000, 120000),
        type,
        randomInt(5, 60)
      ]
    );
  }

  console.log("🤖 Bot players ensured:", BOT_PLAYERS.length);
}

async function botTapToZero(bot) {
  const energy = Number(bot.energy || 0);
  if (energy <= 0) return;

  let tapPower = Number(bot.tap_power || 1);
  const now = new Date();

  if (bot.tap_boost_until && now < new Date(bot.tap_boost_until)) {
    tapPower += 3;
  }

  const earned = energy * tapPower;

  await query(
    `
    UPDATE users
    SET
      balance = balance + $1,
      energy = 0,
      last_seen = NOW(),
      last_energy_update = NOW()
    WHERE telegram_id = $2::text
    `,
    [earned, bot.telegram_id]
  );

  console.log(`🤖 ${bot.name} clicked ${energy}, earned ${earned} NXN`);
}

async function botStakeIfOpen(bot) {
  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "STAKE_ACTIVE") return;

  const fresh = await query(
    `
    SELECT balance
    FROM users
    WHERE telegram_id = $1::text
    `,
    [bot.telegram_id]
  );

  if (fresh.rowCount === 0) return;

  const balance = Number(fresh.rows[0].balance || 0);
  if (balance < 10000) return;

  let maxStake = 25000;

  if (bot.bot_type === "aggressive") maxStake = 90000;
  if (bot.bot_type === "medium") maxStake = 50000;

  const stakeAmount = randomInt(10000, Math.min(balance, maxStake));

  await query("BEGIN");

  try {
    await query(
      `
      UPDATE users
      SET balance = balance - $1,
          last_stake_change = NOW()
      WHERE telegram_id = $2::text
        AND balance >= $1
      `,
      [stakeAmount, bot.telegram_id]
    );

    await query(
      `
      INSERT INTO reward_event_stakes (
        cycle_id,
        telegram_id,
        stake_amount,
        last_updated
      )
      VALUES ($1, $2::text, $3, NOW())
      ON CONFLICT (cycle_id, telegram_id)
      DO UPDATE SET
        stake_amount = reward_event_stakes.stake_amount + EXCLUDED.stake_amount,
        last_updated = NOW()
      `,
      [cycle.id, bot.telegram_id, stakeAmount]
    );

    await query("COMMIT");

    console.log(`🏆 ${bot.name} staked ${stakeAmount} NXN`);
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }
}

async function runBotTick() {
  try {
    const bots = await query(`
      SELECT *
      FROM users
      WHERE is_bot = true
        AND bot_next_action_at <= NOW()
      ORDER BY bot_next_action_at ASC
      LIMIT 20
    `);

    for (const bot of bots.rows) {
      await botTapToZero(bot);
      await botStakeIfOpen(bot);

      await query(
        `
        UPDATE users
        SET bot_next_action_at = NOW() + ($1 || ' minutes')::interval
        WHERE telegram_id = $2::text
        `,
        [nextDelayMinutes(bot.bot_type), bot.telegram_id]
      );
    }
  } catch (err) {
    console.error("Bot engine error:", err);
  }
}

export async function initBotEngine() {
  await ensureBotPlayers();

  console.log("🤖 Bot engine INIT");

  setInterval(() => {
    runBotTick();
  }, 60 * 1000);
}