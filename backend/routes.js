import express from "express";
import { query } from "./db.js";

const router = express.Router();


async function getCurrentRewardCycle() {
  const res = await query(`
    SELECT *
    FROM reward_cycles
    ORDER BY id DESC
    LIMIT 1
  `);

  if (res.rowCount === 0) return null;

  const c = res.rows[0];
  const now = new Date();

  let state = "STAKE_ACTIVE";
  if (now > c.stake_end_at && now <= c.claim_end_at) {
    state = "CLAIM_ACTIVE";
  }
  if (now > c.claim_end_at) {
    state = "RESET";
  }

  return { ...c, state };
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
    WHERE telegram_id = $2
    `,
    [earned, user.telegram_id]
  );

  return earned;
}



async function applyEnergyRegen(userId) {
  const result = await query(
    `
    UPDATE users
    SET
      energy = LEAST(
        max_energy,
        energy + FLOOR(EXTRACT(EPOCH FROM (NOW() - last_energy_update)) / 3)
      ),
      last_energy_update = NOW()
    WHERE
      telegram_id = $1
      AND energy < max_energy
    RETURNING energy
    `,
    [userId]
  );

  return result.rowCount > 0;
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


/* ===== GET ME ===== */
router.get("/me/:id", async (req, res) => {
  const { id } = req.params;

  await applyEnergyRegen(id);

  const result = await query(
    `
    SELECT
  telegram_id,
  balance,
  energy,
  max_energy,
  tap_power,
  autoclicker_until,
  tap_boost_until,
  energy_boost_until,
  last_seen
FROM users

    WHERE telegram_id = $1
    `,
    [String(id)]
  );

  if (result.rowCount === 0) {
    return res.json({
      balance: 0,
      energy: 100,
      maxEnergy: 100,
      tapPower: 1
    });
  }

  const u = result.rows[0];

  res.json({
    balance: Number(u.balance),
    energy: Number(u.energy),
    maxEnergy: Number(u.max_energy),
    tapPower: Number(u.tap_power)
  });
});

//ton//
router.post("/ton-confirm", async (req, res) => {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
    return res.json({ ok: false });
  }

  // ⛔ защита от повторной покупки
  const check = await query(
    `
    SELECT autoclicker_until
    FROM users
    WHERE telegram_id = $1
    `,
    [userId]
  );

  const user = check.rows[0];

  if (
    itemId === "autoclicker_30d" &&
    user.autoclicker_until &&
    new Date(user.autoclicker_until) > new Date()
  ) {
    return res.json({ ok: false, error: "Autoclicker already active" });
  }

  // ✅ AUTCLICKER 30 DAYS
  if (itemId === "autoclicker_30d") {
    await query(
      `
      UPDATE users
      SET autoclicker_until = NOW() + INTERVAL '30 days'
      WHERE telegram_id = $1
      `,
      [userId]
    );
  }

  // (сюда же позже можно добавить tap_plus_3, energy_plus_300)

  res.json({ ok: true });
});


/* ===== TAP ===== */
router.post("/tap", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ ok: false });

  await applyEnergyRegen(id);

  // 1️⃣ получаем пользователя
  const userRes = await query(
    `
    SELECT *
    FROM users
    WHERE telegram_id = $1
    `,
    [String(id)]
  );

  if (userRes.rowCount === 0) {
    return res.json({ ok: false });
  }

  const user = userRes.rows[0];

  // 2️⃣ оффлайн автокликер
  const earnedOffline = await applyAutoclicker(user);

  // 3️⃣ обычный тап
  const result = await query(
    `
    UPDATE users
    SET
      balance = balance + tap_power,
      energy = GREATEST(energy - 1, 0),
      last_seen = NOW()
    WHERE telegram_id = $1
    RETURNING
      balance,
      energy,
      max_energy,
      tap_power,
      tap_boost_until,
      energy_boost_until,
      autoclicker_until
    `,
    [String(id)]
  );

  const u = result.rows[0];

  // 4️⃣ применяем бусты
  const boosted = await applyBoosts(u);

  // 5️⃣ ответ клиенту
  res.json({
    ok: true,
    balance: Number(u.balance),
    energy: Number(u.energy),
    maxEnergy: boosted.maxEnergy,
    tapPower: boosted.tapPower,
    offlineEarned: earnedOffline,   // ✅ ТЕПЕРЬ СУЩЕСТВУЕТ
    boosts: {
      tap: u.tap_boost_until,
      energy: u.energy_boost_until,
      autoclicker: u.autoclicker_until
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
    `SELECT balance FROM users WHERE telegram_id = $1`,
    [fromId]
  );

  if (sender.rowCount === 0 || sender.rows[0].balance < amount) {
    return res.json({ ok: false, error: "Not enough balance" });
  }

  const fee = Math.floor(amount * 0.1);
  const received = amount - fee;

  await query(
    `UPDATE users SET balance = balance - $1 WHERE telegram_id = $2`,
    [amount, fromId]
  );

  await query(
    `UPDATE users SET balance = balance + $1 WHERE telegram_id = $2`,
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
    `SELECT balance, tap_power, max_energy FROM users WHERE telegram_id = $1`,
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
    return res.json({ active: false });
  }

  // текущий стейк пользователя в этом цикле
  const stakeRes = await query(
  `
  SELECT COALESCE(SUM(stake_amount), 0) AS stake
  FROM reward_stakes
  WHERE telegram_id = $1
    AND cycle_id = $2
  `,
  [userId, cycle.id]
);


  const userStake = Number(stakeRes.rows[0].stake || 0);

  // баланс пользователя
  const userRes = await query(
    `SELECT balance FROM users WHERE telegram_id = $1`,
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
  const { id, amount } = req.body;

  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "STAKE_ACTIVE") {
    return res.json({ ok: false, error: "Stake is not active" });
  }

  if (amount < 50000 || amount > 1000000) {
    return res.json({ ok: false, error: "Invalid stake amount" });
  }

  const userRes = await query(
    `SELECT balance, last_stake_change FROM users WHERE telegram_id = $1`,
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
    WHERE telegram_id = $2
    `,
    [amount, id]
  );

  // ДОБАВЛЯЕМ СТЕЙК (НЕ ЗАМЕНЯЕМ, А НАКАПЛИВАЕМ)
  await query(
    `
    INSERT INTO reward_stakes (cycle_id, telegram_id, stake_amount)
    VALUES ($1, $2, $3)
    `,
    [cycle.id, id, amount]
  );

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
      rs.stake_amount,
      u.name,
      u.avatar
    FROM reward_stakes rs
    JOIN users u ON u.telegram_id = rs.telegram_id
    WHERE rs.cycle_id = $1
    ORDER BY rs.stake_amount DESC
  `, [cycle.id]);

  if (all.rowCount === 0) {
    return res.json({ top: [], me: null });
  }

  const maxStake = Number(all.rows[0].stake_amount);

  let me = null;

  const top = all.rows.slice(0, 100).map((u, index) => {
    const rank = index + 1;
    const progress = Math.max(
      5,
      Math.round((Number(u.stake_amount) / maxStake) * 100)
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

  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "CLAIM_ACTIVE") {
    return res.json({ ok: false, error: "Claim not active" });
  }

  const all = await query(
    `
    SELECT telegram_id
    FROM reward_stakes
    WHERE cycle_id = $1
    ORDER BY stake_amount DESC
    `,
    [cycle.id]
  );

  const rank =
    all.rows.findIndex(r => r.telegram_id === id) + 1;

  if (rank === 0 || rank > 500) {
    return res.json({ ok: false, error: "Not eligible" });
  }

  let reward = 0;
  if (rank <= 10) reward = 10;
  else if (rank <= 50) reward = 5;
  else if (rank <= 200) reward = 3;
  else reward = 1;

  await query(
  `
  INSERT INTO reward_stakes (cycle_id, telegram_id, stake_amount)
  VALUES ($1, $2, $3)
  `,
  [cycle.id, id, amount]
);


  res.json({ ok: true, reward });
});



export default router;
