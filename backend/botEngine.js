import { query } from "./db.js";

const BOT_PLAYERS = [
  ["900000001", "alex_77", "aggressive", "https://i.pinimg.com/736x/4d/9b/d0/4d9bd02d718c4909b69b2618e707f0e0.jpg"],
  ["900000002", "maksim", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrUsmO133AFxw2fDUbWzemC27xBUKL1MFpaA&s"],
  ["900000003", "denis_01", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJiHE_tGKEs93mskoCU0gZ_I34wAQw1VWUpw&s"],
  ["900000004", "leo", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtBE6KTerqkBeMU1uRVioAa8_2A5am9n4e4w&s"],
  ["900000005", "timur", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyAbvTZ-eu2ZuETNaDwD-Fl-_hCAhIzBb5-g&s"],
  ["900000006", "nick99", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkUMjTBWiv5XkRfbalr8a7QfSiw2SilItNPA&s"],

  ["900000007", "ryan", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvVTEgPpEXGiGCePHk81PAVSMHILxnp34rCg&s"],
  ["900000008", "adam_x", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrb3eL3Lr-xsEmfHyW-l3GlsBB0HPGG2iQvw&s"],
  ["900000009", "marko", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5KAzOehBCHcqXIKklMa8ZGiqAa_1GV94oeiidlUYyThZJsRklE5jyc5w&s"],
  ["900000010", "chris_88", "medium", "https://i.pravatar.cc/150?img=24"],
  ["900000011", "sam", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ-j0SlWpRYz1lgkq7zLvEkEhc-9XzZrcLPg&s"],
  ["900000012", "daniel", "medium", "https://avatars.mds.yandex.net/get-shedevrum/11451254/img_d30bb68e058211efa5849a79ffaf5bd2/orig"],
  ["900000013", "oliver_7", "medium", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAkFBMVEX+AAD8AwD6BADBBQfXBQj9AQX5BAP6BQb1BQ3zBQb0BgPtBAfpBwvqCgfOBQyqBQvTBQu8CgmfCQriCAi0BgnNBg/MBgfJLxudcTegbzKdcjOsXCoABQuPAwg1BQqcBg5wBxB7BxNbBgt1BgmUcDk262pA5GmCuVahAACYCAvSCQarBgi6RSV8lkqAkkiXdjuaz4EoAAABLElEQVR4nO3Uy3LTQBAF0BlJI1mRJcvWAwIEh5chmIT//zuUClSqXGzl1Tmb6d2dru6ZEMuYYgxlFhchxSzEsoxZDDGsLVuyqyo9H1dIuwz/Vyxdx2qTNvVNk7ah7Xb9vjm0YWjGfE6rX+PmvC3GqWgOUz5vV0+7EN+8vb199z6rt8vk8w93H6duHot2PO7b+/qcUlfNeb/+ZIr7bn+cjs2nu89fitXTLn39djqdvv8YH5Y9qPt2GOqiLkL+Mx92/bxcbir6bv09aB6m6bDbN1O2Ow+rp1369fj09Pi7Hjbl83MIf59jemk7vpbrSuElJVUhXCPvf7LXjwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK7uD/XQCpdnDtIoAAAAAElFTkSuQmCC"],

  ["900000014", "mike_crypto", "neutral", "https://cs9.pikabu.ru/post_img/2016/11/05/8/1478348889113012245.jpg"],
  ["900000015", "tony", "https://wallpaper.forfun.com/fetch/49/4903ea88841e11ebe216139e70aa0c98.jpeg"],
  ["900000016", "kevindeb", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cBxFhdLKzPJTd7rABBDj-kO_4WqUah6xwQ&s"],
  ["900000017", "jacklore", "neutral", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAA1BMVEVGm94gs2CqAAAALElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgZViQAAd2fpbUAAAAASUVORK5CYII="],
  ["900000018", "evan", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF0QMj_YHqItYwHB2kdbNKP6JsqeE88r28Rw&s"],
  ["900000019", "noah", "neutral", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAA1BMVEWZ/5lPT2g3AAAASElEQVR4nO3BgQAAAADDoPlTX+AIVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwDcaiAAFXD1ujAAAAAElFTkSuQmCC"],
  ["900000020", "liamak", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtS1C8WvMvlNVofTBFMBZ6S4EpMs9AJv3cWA&s"],
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextDelayMinutes(type) {
  if (type === "aggressive") return randomInt(25, 40); // 🔥 быстрее
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
  0,                -- ✅ баланс = 0
  100,
  100,
  1,
  true,
  $4,
  NOW() + ($5 || ' minutes')::interval,
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
        type,
        randomInt(1, 3)
      ]
    );
  }

  console.log("🤖 Bot players ensured:", BOT_PLAYERS.length);
}
async function botTapToZero(bot) {
  const maxEnergy = Number(bot.energy || 0);
  if (maxEnergy <= 0) return;

  const taps = randomInt(5, Math.min(40, maxEnergy)); // ✅ не всё тратит

  let tapPower = Number(bot.tap_power || 1);
  const now = new Date();

  if (bot.tap_boost_until && now < new Date(bot.tap_boost_until)) {
    tapPower += 3;
  }

  const earned = taps * tapPower;

  await query(
    `
    UPDATE users
    SET
      balance = balance + $1,
      energy = energy - $2,  -- ✅ уменьшаем, а не 0
      last_seen = NOW()
    WHERE telegram_id = $3::text
    `,
    [earned, taps, bot.telegram_id]
  );

  console.log(`🤖 ${bot.name} tapped ${taps}, earned ${earned}`);
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