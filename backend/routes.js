import express from "express";
import { query } from "./db.js";

const router = express.Router();



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

  let state = null;

  if (now >= new Date(c.start_at) && now <= new Date(c.stake_end_at)) {
    state = "STAKE_ACTIVE";
  } else if (
    now > new Date(c.stake_end_at) &&
    now <= new Date(c.claim_end_at)
  ) {
    state = "CLAIM_ACTIVE";
  }

  return {
    id: c.id,
    state,
    stake_end_at: c.stake_end_at,
    claim_end_at: c.claim_end_at
  };
}






async function applyBoosts(user) {
  const now = new Date();

  let tapPower = user.tap_power;
  let maxEnergy = user.max_energy;

  // TON tap +3 (30 days)
  if (user.tap_boost_until && now < user.tap_boost_until) {
    tapPower += 3;
  }

  // TON energy +300 (30 days)
  if (user.energy_boost_until && now < user.energy_boost_until) {
    maxEnergy += 300;
  }

  return { tapPower, maxEnergy };
}

async function applyAutoclicker(user) {
  if (!user.autoclicker_until) return 0;

  const now = new Date();
  const until = new Date(user.autoclicker_until);

  if (now > until) return 0;

  const lastSeen = user.last_seen
    ? new Date(user.last_seen)
    : now;

  const diffSeconds = Math.floor((now - lastSeen) / 1000);
  if (diffSeconds <= 0) return 0;

  const CLICKS_PER_SEC = 0.5; // 1 клик в 2 секунды
  const earned = Math.floor(
    diffSeconds * CLICKS_PER_SEC * user.tap_power
  );

  if (earned <= 0) return 0;

  await query(
    `
    UPDATE users
    SET balance = balance + $1,
        last_seen = NOW()
    WHERE telegram_id = $2::text
  
    `,
    [earned, user.telegram_id]
  );

  return earned;
}



async function applyEnergyRegen(user) {
  const now = new Date();
  const last = user.last_energy_update
    ? new Date(user.last_energy_update)
    : now;

  const diffSec = Math.floor((now - last) / 1000);
  if (diffSec < 3) return; // ⛔ меньше 3 секунд — ничего

  const regenPoints = Math.floor(diffSec / 3); // ✅ 1 энергия = 3 сек

  const boosted = await applyBoosts(user);
  const maxEnergy = boosted.maxEnergy;

  const newEnergy = Math.min(
    maxEnergy,
    user.energy + regenPoints
  );

  await query(`
    UPDATE users
    SET
      energy = $1,
      last_energy_update = NOW()
    WHERE telegram_id = $2::text
      AND energy < $1
  `, [newEnergy, user.telegram_id]);
}





/* ===== SYNC USER ===== */
router.post("/sync", async (req, res) => {
  const { id, username, first_name, photo_url } = req.body;
  if (!id) return res.json({ ok: false });

  await query(
    `
    INSERT INTO users (telegram_id, name, avatar)
    VALUES ($1, $2, $3)
    ON CONFLICT (telegram_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      avatar = EXCLUDED.avatar
    `,
    [
      String(id),
      username || first_name || "User",
      photo_url || ""
    ]
  );

  res.json({ ok: true });
});


router.get("/__debug/db", async (req, res) => {
  const r = await query(`
    SELECT current_database() as db,
           current_user as user,
           inet_server_addr() as host
  `);
  res.json(r.rows[0]);
});



router.get("/me/:id", async (req, res) => {
  const { id } = req.params;

  const userRes = await query(`
    SELECT *
    FROM users
    WHERE telegram_id = $1::text
  `, [String(id)]);

  if (userRes.rowCount === 0) {
    return res.json({ ok: false, error: "USER_NOT_FOUND" });
  }

  const user = userRes.rows[0];

  await applyEnergyRegen(user); // ✅ ТЕПЕРЬ ОК

  const boosted = await applyBoosts(user);

  res.json({
    balance: Number(user.balance),
    energy: Number(user.energy),
    maxEnergy: boosted.maxEnergy,
    tapPower: boosted.tapPower,
    boosts: {
      tap: user.tap_boost_until,
      energy: user.energy_boost_until,
      autoclicker: user.autoclicker_until
    }
  });
});


//ton//
router.post("/ton-confirm", async (req, res) => {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
    return res.json({ ok: false });
  }

  const userRes = await query(`
    SELECT
      tap_boost_until,
      energy_boost_until,
      autoclicker_until
    FROM users
    WHERE telegram_id = $1
  `, [userId]);

  if (userRes.rowCount === 0) {
    return res.json({ ok: false, error: "User not found" });
  }

  const user = userRes.rows[0];
  const now = new Date();

  // ===== TAP +3 (30 days) =====
  if (itemId === "tap_plus_3") {
    if (user.tap_boost_until && new Date(user.tap_boost_until) > now) {
      return res.json({ ok: false, error: "Tap boost already active" });
    }

    await query(`
      UPDATE users
      SET tap_boost_until = NOW() + INTERVAL '30 days'
      WHERE telegram_id = $1
    `, [userId]);
  }

  // ===== ENERGY +300 (30 days) =====
  else if (itemId === "energy_plus_300") {
    if (user.energy_boost_until && new Date(user.energy_boost_until) > now) {
      return res.json({ ok: false, error: "Energy boost already active" });
    }

    await query(`
      UPDATE users
      SET energy_boost_until = NOW() + INTERVAL '30 days'
      WHERE telegram_id = $1
    `, [userId]);
  }

  // ===== AUTCLICKER (30 days) =====
  else if (itemId === "autoclicker_30d") {
    if (user.autoclicker_until && new Date(user.autoclicker_until) > now) {
      return res.json({ ok: false, error: "Autoclicker already active" });
    }

    await query(`
      UPDATE users
      SET autoclicker_until = NOW() + INTERVAL '30 days'
      WHERE telegram_id = $1
    `, [userId]);
  }

  else {
    return res.json({ ok: false, error: "Unknown TON item" });
  }

  res.json({ ok: true });
});


async function runAutoclickers() {
  console.log("🔥 runAutoclickers CALLED");

  const res = await query(`
    SELECT *
    FROM users
    WHERE autoclicker_until IS NOT NULL
      AND autoclicker_until > NOW()
  `);

  console.log("👥 autoclick users:", res.rowCount);

  for (const u of res.rows) {
    const now = new Date();
    const last = u.last_autoclick_at
      ? new Date(u.last_autoclick_at)
      : now;

    const diffSec = Math.floor((now - last) / 1000);

    // ⛔ 1 клик в 2 секунды
    const clicks = Math.floor(diffSec / 2);
    if (clicks <= 0) continue;

    const boosted = await applyBoosts(u);
    const earned = clicks * boosted.tapPower;

    await query(`
      UPDATE users
      SET
        balance = balance + $1,
        last_autoclick_at = NOW()
      WHERE telegram_id = $2::text
    `, [earned, u.telegram_id]);

    console.log(
  `USER ${u.telegram_id} diff=${diffSec}s clicks=${clicks} earned=${earned}`
    );
  }
}




/* ===== TAP ===== */
router.post("/tap", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ ok: false });

  const userRes = await query(`
    SELECT *
    FROM users
    WHERE telegram_id = $1::text
  `, [String(id)]);

  if (userRes.rowCount === 0) {
    return res.json({ ok: false });
  }

  const user = userRes.rows[0];

  await applyEnergyRegen(user); // ✅ теперь корректно

  const boosted = await applyBoosts(user);
  const realTapPower = boosted.tapPower;

 const result = await query(`
  UPDATE users
  SET
    balance = balance + $1,
    energy = energy - 1,
    last_seen = NOW()
  WHERE telegram_id = $2::text
    AND energy > 0
  RETURNING balance, energy
`, [realTapPower, String(id)]);


  const u = result.rows[0];

  res.json({
    balance: Number(u.balance),
    energy: Number(u.energy),
    maxEnergy: boosted.maxEnergy,
    tapPower: realTapPower,
    boosts: {
      tap: user.tap_boost_until,
      energy: user.energy_boost_until,
      autoclicker: user.autoclicker_until
    }
  });
});



/* ===== TRANSFER ===== */
router.post("/transfer", async (req, res) => {
  let { fromId, toId, amount } = req.body;

  fromId = String(fromId);
  toId = String(toId);
  amount = Number(amount);

  const MIN_TRANSFER = 100;

  if (!fromId || !toId) {
    return res.json({ ok: false, error: "Invalid user ID" });
  }

  if (!Number.isFinite(amount) || amount < MIN_TRANSFER) {
    return res.json({
      ok: false,
      error: `Minimum transfer is ${MIN_TRANSFER} NXN`
    });
  }

  if (fromId === toId) {
    return res.json({ ok: false, error: "Cannot transfer to yourself" });
  }

  const sender = await query(
    `SELECT balance FROM users WHERE telegram_id = $1::text`,
    [fromId]
  );

  if (sender.rowCount === 0 || sender.rows[0].balance < amount) {
    return res.json({ ok: false, error: "Not enough balance" });
  }

  const fee = Math.floor(amount * 0.1);
  const received = amount - fee;

  await query(
    `UPDATE users SET balance = balance - $1 WHERE telegram_id = $2::text
  `,
    [amount, fromId]
  );

  await query(
    `UPDATE users SET balance = balance + $1 WHERE telegram_id = $2::text
  `,
    [received, toId]
  );

  await query(
    `
    INSERT INTO transfers (from_id, to_id, amount, fee, received)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [fromId, toId, amount, fee, received]
  );

  res.json({ ok: true, received });
});

/* ===== LEADERBOARD ===== */
router.get("/leaderboard", async (req, res) => {
  const result = await query(
    `
    SELECT telegram_id, name, avatar, balance
    FROM users
    ORDER BY balance DESC
    LIMIT 10
    `
  );

  res.json(result.rows);
});

/* ===== TRANSFER HISTORY ===== */
router.get("/history/:id", async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `
    SELECT from_id, to_id, amount, fee, received, created_at
    FROM transfers
    WHERE from_id = $1 OR to_id = $1
    ORDER BY created_at DESC
    LIMIT 20
    `,
    [id]
  );

  res.json(result.rows);
});

/* ===== BUY FOR NXN ===== */
router.post("/buy-nxn", async (req, res) => {
  const { id, itemId } = req.body;
  if (!id || !itemId) {
    return res.json({ ok: false, error: "Invalid request" });
  }

  const userRes = await query(
    `SELECT balance, tap_power, max_energy FROM users WHERE telegram_id = $1::text`,
    [id]
  );

  if (userRes.rowCount === 0) {
    return res.json({ ok: false, error: "User not found" });
  }

  let { balance, tap_power, max_energy } = userRes.rows[0];

  // ===== SHOP ITEMS =====
  let price = 0;

  if (itemId === "tap_plus_1") {
    price = 30000;

    // ⛔ защита от повторной покупки
    if (tap_power >= 2) {
      return res.json({ ok: false, error: "Tap Power already purchased" });
    }

    // ⛔ недостаточно баланса
    if (balance < price) {
      return res.json({ ok: false, error: "Not enough NXN" });
    }

    tap_power += 1;
  }


  else if (itemId === "energy_plus_100") {
    price = 50000;

    // ⛔ защита от повторной покупки
    if (max_energy >= 200) {
      return res.json({ ok: false, error: "Energy upgrade already purchased" });
    }

    if (balance < price) {
      return res.json({ ok: false, error: "Not enough NXN" });
    }

    max_energy += 100;
  }

  else {
    return res.json({ ok: false, error: "Unknown item" });
  }

  balance -= price;

  await query(
    `
    UPDATE users
    SET balance = $1, tap_power = $2, max_energy = $3
    WHERE telegram_id = $4
    `,
    [balance, tap_power, max_energy, id]
  );

  res.json({
    ok: true,
    balance,
    tapPower: tap_power,
    maxEnergy: max_energy
  });
});

/* ===== REWARD EVENT STATE ===== */
router.get("/reward/state/:userId", async (req, res) => {
  const { userId } = req.params;

  const cycle = await getCurrentRewardCycle();
  if (!cycle) {
    return res.json({ state: null });
  }


  // текущий стейк пользователя в этом цикле
  const stakeRes = await query(
    `
  SELECT COALESCE(SUM(stake_amount), 0) AS stake
  FROM reward_event_stakes
  WHERE telegram_id = $1::text
    AND cycle_id = $2
  `,
    [userId, cycle.id]
  );


  const userStake = Number(stakeRes.rows[0].stake || 0);

  // баланс пользователя
  const userRes = await query(
    `SELECT balance FROM users WHERE telegram_id = $1::text`,
    [userId]
  );

  const balance = userRes.rowCount
    ? Number(userRes.rows[0].balance)
    : 0;

  res.json({
    state: cycle.state,
    stakeEndsAt: cycle.stake_end_at,
    claimEndsAt: cycle.claim_end_at,
    userStake,
    balance
  });
});




router.post("/reward/stake", async (req, res) => {
  const id = String(req.body.id);
  const amount = Number(req.body.amount);

  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "STAKE_ACTIVE") {
    return res.json({ ok: false, error: "Stake is not active" });
  }

  if (amount < 10000 || amount > 1000000) {
    return res.json({ ok: false, error: "Invalid stake amount" });
  }

  const userRes = await query(
    `SELECT balance, last_stake_change FROM users WHERE telegram_id = $1::text`,
    [id]
  );



  if (userRes.rowCount === 0) {
    return res.json({ ok: false, error: "User not found" });
  }

  const user = userRes.rows[0];

  // cooldown 60s (ОСТАВЛЯЕМ)
  if (
    user.last_stake_change &&
    Date.now() - new Date(user.last_stake_change).getTime() < 60000
  ) {
    return res.json({ ok: false, error: "Cooldown active" });
  }

  if (user.balance < amount) {
    return res.json({ ok: false, error: "Not enough NXN" });
  }

  await query("BEGIN");

  // списываем баланс
  await query(
    `
    UPDATE users
    SET balance = balance - $1,
        last_stake_change = NOW()
    WHERE telegram_id = $2::text
  
    `,
    [amount, id]
  );

  // ДОБАВЛЯЕМ СТЕЙК (НЕ ЗАМЕНЯЕМ, А НАКАПЛИВАЕМ)
  await query(`
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
`, [cycle.id, id, amount]);


  await query("COMMIT");

  res.json({ ok: true });
});




router.get("/reward/leaderboard/:userId", async (req, res) => {
  const { userId } = req.params;
  const cycle = await getCurrentRewardCycle();
  if (!cycle) {
    return res.json({ top: [], me: null });
  }

  // получаем всех игроков цикла
  const all = await query(`
  SELECT
  rs.telegram_id,
  SUM(rs.stake_amount) AS total_stake,
  u.name,
  u.avatar
FROM reward_event_stakes rs
JOIN users u ON u.telegram_id = rs.telegram_id
WHERE rs.cycle_id = $1
GROUP BY rs.telegram_id, u.name, u.avatar
ORDER BY total_stake DESC
  `, [cycle.id]);

  if (all.rowCount === 0) {
    return res.json({ top: [], me: null });
  }

  const maxStake = Number(all.rows[0].total_stake);

  let me = null;

  const top = all.rows.slice(0, 100).map((u, index) => {
    const rank = index + 1;
    const progress = Math.max(
      5,
      Math.round((Number(u.total_stake) / maxStake) * 100)
    );

    if (u.telegram_id === userId) {
      me = { rank, progress };
    }

    return {
      rank,
      name: u.name,
      avatar: u.avatar,
      progress
    };
  });

  // если игрок не в топ-100 — ищем его позицию
  if (!me) {
    const idx = all.rows.findIndex(
      r => r.telegram_id === userId
    );

    if (idx !== -1) {
      me = {
        rank: idx + 1,
        progress: Math.max(
          5,
          Math.round((Number(all.rows[idx].stake_amount) / maxStake) * 100)
        )
      };
    }
  }

  res.json({ top, me });
});




router.post("/reward/claim", async (req, res) => {
  const { id, wallet } = req.body;

  // 1️⃣ проверяем цикл
  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "CLAIM_ACTIVE") {
    return res.json({ ok: false, error: "Claim not active" });
  }

  // 2️⃣ защита от двойного claim
  const already = await query(`
    SELECT 1
    FROM reward_event_claims
    WHERE cycle_id = $1 AND telegram_id = $2::text
  `, [cycle.id, id]);

  if (already.rowCount > 0) {
    return res.json({ ok: false, error: "Already claimed" });
  }

  // 3️⃣ определяем ранг
  const all = await query(`
    SELECT telegram_id, SUM(stake_amount) AS total
FROM reward_event_stakes
WHERE cycle_id = $1
GROUP BY telegram_id
ORDER BY total DESC
  `, [cycle.id]);

  const rank =
    all.rows.findIndex(r => r.telegram_id === id) + 1;

  if (rank === 0 || rank > 500) {
    return res.json({ ok: false, error: "Not eligible" });
  }

  // 4️⃣ расчёт награды (ПО ТВОЕМУ ТЗ)
  let reward = 0;

  if (rank <= 10) reward = 10;
  else if (rank <= 50) reward = 5;
  else if (rank <= 200) reward = 3;
  else reward = 1;

  // 5️⃣ сохраняем claim
  await query(`
  INSERT INTO reward_event_claims
    (cycle_id, telegram_id, wallet, reward_amount, status)
  VALUES ($1, $2, $3, $4, 'PENDING')
`, [cycle.id, id, wallet, reward]);


  // ❗ здесь позже будет TON send

  res.json({ ok: true, reward });
});


router.get("/reward/claim-info/:userId", async (req, res) => {
  const { userId } = req.params;

  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "CLAIM_ACTIVE") {
    return res.json({ eligible: false });
  }

  // уже клеймил?
  const claimed = await query(`
    SELECT 1 FROM reward_event_claims
    WHERE cycle_id = $1 AND telegram_id = $2::text
  `, [cycle.id, userId]);

  if (claimed.rowCount > 0) {
    const info = await query(`
    SELECT wallet, reward_amount
    FROM reward_event_claims
    WHERE cycle_id = $1 AND telegram_id = $2::text
  `, [cycle.id, userId]);

    return res.json({
      eligible: true,
      claimed: true,
      wallet: info.rows[0].wallet,
      reward: info.rows[0].reward_amount
    });
  }

  // определяем ранг
  const all = await query(`
    SELECT telegram_id
    FROM reward_event_stakes
    WHERE cycle_id = $1
    GROUP BY telegram_id
    ORDER BY SUM(stake_amount) DESC
  `, [cycle.id]);

  const rank =
    all.rows.findIndex(r => r.telegram_id === userId) + 1;

  if (rank === 0 || rank > 500) {
    return res.json({ eligible: false });
  }

  let reward = 0;
  if (rank <= 10) reward = 10;
  else if (rank <= 50) reward = 5;
  else if (rank <= 200) reward = 3;
  else reward = 1;

  res.json({
    eligible: true,
    rank,
    reward
  });
});


// ================= REWARD CYCLE AUTO CHECK =================
async function checkRewardCycle() {
  const res = await query(`
    SELECT *
    FROM reward_event_cycles
    ORDER BY id DESC
    LIMIT 1
  `);

  if (res.rowCount === 0) {
    await query(`
    INSERT INTO reward_event_cycles (
      start_at,
      stake_end_at,
      claim_end_at,
      reward_pool_total,
      carry_over
    )
    VALUES (
      NOW(),
      NOW() + INTERVAL '7 days',
      NOW() + INTERVAL '9 days',
      1500,
      0
    )
  `);
    return;
  }


  const cycle = res.rows[0];
  const now = new Date();

  // ⛔ claim ещё не закончился — ничего не делаем
  if (now <= new Date(cycle.claim_end_at)) return;

  console.log("⏳ Reward cycle ended. Starting new cycle...");

  // 🔥 стейки просто очищаем (они сгорели)
  await query(`DELETE FROM reward_event_stakes`);
  await query(`DELETE FROM reward_event_claims`);

  // 🚀 новый цикл: 7 дней stake + 2 дня claim
  await query(`
  INSERT INTO reward_event_cycles (
    start_at,
    stake_end_at,
    claim_end_at,
    reward_pool_total,
    carry_over
  )
  VALUES (
    NOW(),
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '9 days',
    1500,
    0
  )
`);


  console.log("✅ New reward cycle created");
}


export { checkRewardCycle, runAutoclickers };

export default router;

