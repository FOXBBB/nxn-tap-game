import express from "express";
import { query } from "./db.js";
import { checkSubscription } from "./telegram.js";


function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "NXN-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

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


router.get("/referral/me/:userId", async (req, res) => {
  const { userId } = req.params;

  const userRes = await query(`
    SELECT
      referral_code,
      referred_by,
      referral_stack_balance
    FROM users
    WHERE telegram_id = $1::text
  `, [userId]);

  if (userRes.rowCount === 0) {
    return res.json({ ok: false });
  }

  // invited count
  const invitedRes = await query(`
    SELECT COUNT(*)::int AS invited
    FROM referral_links
    WHERE inviter_id = $1
  `, [userId]);

  // active referrals (реально сделали stake > 0)
  const activeRes = await query(`
    SELECT COUNT(DISTINCT rl.invited_id)::int AS active
    FROM referral_links rl
    JOIN reward_event_stakes rs
      ON rs.telegram_id = rl.invited_id
    WHERE rl.inviter_id = $1
      AND rs.stake_amount > 0
  `, [userId]);

  // total earned = invited * 50k
  const invited = invitedRes.rows[0].invited;
  const totalEarned = invited * 50000;

  res.json({
    ok: true,
    referralCode: userRes.rows[0].referral_code,
    referredBy: userRes.rows[0].referred_by,
    referralStackBalance: Number(userRes.rows[0].referral_stack_balance),
    stats: {
      invited,
      active: activeRes.rows[0].active,
      totalEarned
    }
  });
});







async function applyEnergyRegen(user) {
  const now = new Date();

  const last = user.last_energy_update
    ? new Date(user.last_energy_update)
    : now;

  const diffSec = Math.floor((now - last) / 1000);

  // ⛔ меньше 3 секунд — регена нет
  if (diffSec < 3) return;

  // ✅ 1 энергия = 3 секунды
  const regenPoints = Math.floor(diffSec / 3);

  // ✅ вычисляем maxEnergy ПРАВИЛЬНО
  let maxEnergy = user.max_energy;

  if (
    user.energy_boost_until &&
    now < new Date(user.energy_boost_until)
  ) {
    maxEnergy += 300;
  }

  const newEnergy = Math.min(
    maxEnergy,
    user.energy + regenPoints
  );

  await query(
    `
    UPDATE users
    SET
      energy = $1,
      last_energy_update = NOW()
    WHERE telegram_id = $2::text
      AND energy < $3
    `,
    [newEnergy, user.telegram_id, maxEnergy]
  );
}





/* ===== SYNC USER ===== */
router.post("/sync", async (req, res) => {
  const { id, username, first_name, photo_url } = req.body;
  if (!id) return res.json({ ok: false });

  const userRes = await query(
    `SELECT referral_code FROM users WHERE telegram_id = $1::text`,
    [String(id)]
  );

  let referralCode;

  if (userRes.rowCount === 0 || !userRes.rows[0].referral_code) {
    referralCode = generateReferralCode();
  } else {
    referralCode = userRes.rows[0].referral_code;
  }

  await query(`
    INSERT INTO users (
      telegram_id,
      name,
      avatar,
      referral_code
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (telegram_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      avatar = EXCLUDED.avatar,
      referral_code = users.referral_code
  `, [
    String(id),
    username || first_name || "User",
    photo_url || "",
    referralCode
  ]);

  res.json({ ok: true });
});




router.get("/me/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.json({ ok: false });

  // 1️⃣ получаем пользователя
  const userRes = await query(
    `SELECT * FROM users WHERE telegram_id = $1::text`,
    [String(id)]
  );

  if (userRes.rowCount === 0) {
    return res.json({ ok: false });
  }

  const user = userRes.rows[0];

  // 2️⃣ РЕГЕН ЭНЕРГИИ ТОЛЬКО ЗДЕСЬ
  await applyEnergyRegen(user);

  // 3️⃣ применяем бусты
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
  const res = await query(`
    SELECT *
    FROM users
    WHERE autoclicker_until IS NOT NULL
      AND autoclicker_until > NOW()
  `);

  for (const u of res.rows) {
    const now = new Date();

    const last = u.last_autoclick_at
      ? new Date(u.last_autoclick_at)
      : now;

    const diffSec = Math.floor((now - last) / 1000);

    // ⛔ 1 клик = 2 секунды
    const clicks = Math.floor(diffSec / 2);
    if (clicks <= 0) continue;

    // считаем tap power + бусты
    let tapPower = u.tap_power;

    if (
      u.tap_boost_until &&
      now < new Date(u.tap_boost_until)
    ) {
      tapPower += 3;
    }

    const earned = clicks * tapPower;

    await query(
      `
      UPDATE users
      SET
        balance = balance + $1,
        last_autoclick_at = NOW()
      WHERE telegram_id = $2::text
      `,
      [earned, u.telegram_id]
    );
  }
}





/* ===== TAP ===== */
router.post("/tap", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ ok: false });

  const userRes = await query(
    `SELECT * FROM users WHERE telegram_id = $1::text`,
    [String(id)]
  );

  if (userRes.rowCount === 0) {
    return res.json({ ok: false });
  }

  const user = userRes.rows[0];

  // ⛔ энергии нет — стоп
  if (user.energy <= 0) {
    return res.json({
      ok: false,
      balance: Number(user.balance),
      energy: 0,
      tapPower: user.tap_power
    });
  }

  let tapPower = user.tap_power;
  if (
    user.tap_boost_until &&
    new Date() < new Date(user.tap_boost_until)
  ) {
    tapPower += 3;
  }

  // 🔥 ТОЛЬКО СПИСАНИЕ
  const result = await query(
    `
    UPDATE users
    SET
      energy = energy - 1,
      balance = balance + $1,
      last_seen = NOW()
    WHERE telegram_id = $2::text
      AND energy > 0
    RETURNING balance, energy
    `,
    [tapPower, String(id)]
  );

  const u = result.rows[0];

  res.json({
    ok: true,
    balance: Number(u.balance),
    energy: Number(u.energy),
    tapPower
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
    LIMIT 100
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

  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "CLAIM_ACTIVE") {
    return res.json({ ok: false, error: "Claim not active" });
  }

  const already = await query(`
    SELECT 1
    FROM reward_event_claims
    WHERE cycle_id = $1 AND telegram_id = $2::text
  `, [cycle.id, id]);

  if (already.rowCount > 0) {
    return res.json({ ok: false, error: "Already claimed" });
  }

  // 🔥 считаем ранги
  const all = await query(`
    SELECT telegram_id, SUM(stake_amount) AS total
    FROM reward_event_stakes
    WHERE cycle_id = $1
    GROUP BY telegram_id
    ORDER BY total DESC
  `, [cycle.id]);

  const rank = all.rows.findIndex(r => r.telegram_id === id) + 1;

  // ❗ ТОЛЬКО ТОП 100
  if (rank === 0 || rank > 100) {
    return res.json({ ok: false, error: "Not eligible" });
  }

  let reward = 0;

  if (rank <= 10) reward = 6000;
  else if (rank <= 40) reward = 3000;
  else if (rank <= 70) reward = 2000;
  else reward = 1000;

  await query(`
    INSERT INTO reward_event_claims
      (cycle_id, telegram_id, wallet, reward_amount, status)
    VALUES ($1, $2, $3, $4, 'PENDING')
  `, [cycle.id, id, wallet, reward]);

  res.json({ ok: true, reward });
});



router.get("/reward/claim-info/:userId", async (req, res) => {
  const { userId } = req.params;

  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "CLAIM_ACTIVE") {
    return res.json({ eligible: false });
  }

  const claimed = await query(`
    SELECT wallet, reward_amount
    FROM reward_event_claims
    WHERE cycle_id = $1 AND telegram_id = $2::text
  `, [cycle.id, userId]);

  if (claimed.rowCount > 0) {
    return res.json({
      eligible: true,
      claimed: true,
      wallet: claimed.rows[0].wallet,
      reward: claimed.rows[0].reward_amount
    });
  }

  const all = await query(`
    SELECT telegram_id, SUM(stake_amount) AS total
    FROM reward_event_stakes
    WHERE cycle_id = $1
    GROUP BY telegram_id
    ORDER BY total DESC
  `, [cycle.id]);

  const rank = all.rows.findIndex(r => r.telegram_id === userId) + 1;

  // ❗ ТОЛЬКО ТОП 100
  if (rank === 0 || rank > 100) {
    return res.json({ eligible: false });
  }

  let reward = 0;

  if (rank <= 10) reward = 6000;
  else if (rank <= 40) reward = 3000;
  else if (rank <= 70) reward = 2000;
  else reward = 1000;

  res.json({
    eligible: true,
    claimed: false,
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
      240000,
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
    240000,
    0
  )
`);


  console.log("✅ New reward cycle created");
}



router.get("/referral/:userId", async (req, res) => {
  const { userId } = req.params;

  const userRes = await query(`
    SELECT
      referral_code,
      referral_stack_balance
    FROM users
    WHERE telegram_id = $1::text
  `, [userId]);

  if (userRes.rowCount === 0) {
    return res.json({ ok: false });
  }

  const invited = await query(`
    SELECT COUNT(*) FROM referral_links
    WHERE inviter_id = $1
  `, [userId]);

  const active = await query(`
    SELECT COUNT(*)
    FROM referral_links rl
    JOIN reward_event_stakes rs
      ON rs.telegram_id = rl.invited_id
    WHERE rl.inviter_id = $1
      AND rs.stake_amount > 0
  `, [userId]);

  res.json({
    ok: true,
    referralCode: userRes.rows[0].referral_code,
    referralStackBalance: Number(userRes.rows[0].referral_stack_balance),
    invited: Number(invited.rows[0].count),
    active: Number(active.rows[0].count)
  });
});



router.post("/referral/bind", async (req, res) => {
  const { userId, code } = req.body;

  if (!code || !userId) {
    return res.json({ ok: false, error: "Invalid data" });
  }

  const me = await query(`
    SELECT referral_code, referred_by
    FROM users
    WHERE telegram_id = $1::text
  `, [userId]);

  if (me.rows[0].referred_by) {
    return res.json({ ok: false, error: "Already bound" });
  }

  if (me.rows[0].referral_code === code) {
    return res.json({ ok: false, error: "Cannot use your own code" });
  }

  const inviter = await query(`
    SELECT telegram_id
    FROM users
    WHERE referral_code = $1
  `, [code]);

  if (inviter.rowCount === 0) {
    return res.json({ ok: false, error: "Invalid referral code" });
  }

  await query("BEGIN");

  await query(`
    UPDATE users
    SET referred_by = $1,
        referral_stack_balance = referral_stack_balance + 50000
    WHERE telegram_id = $2::text
  `, [inviter.rows[0].telegram_id, userId]);

  await query(`
    UPDATE users
    SET referral_stack_balance = referral_stack_balance + 50000
    WHERE telegram_id = $1::text
  `, [inviter.rows[0].telegram_id]);

  await query(`
    INSERT INTO referral_links (inviter_id, invited_id)
    VALUES ($1, $2)
  `, [inviter.rows[0].telegram_id, userId]);

  await query("COMMIT");

  res.json({ ok: true });
});




router.post("/referral/stake", async (req, res) => {
  const { userId, amount } = req.body;

  const MIN_REF_STAKE = 10000;

if (!Number.isFinite(amount) || amount < MIN_REF_STAKE) {
  return res.json({
    ok: false,
    error: `Minimum referral stake is ${MIN_REF_STAKE} NXN`
  });
}

  const user = await query(`
    SELECT referral_stack_balance
    FROM users
    WHERE telegram_id = $1::text
  `, [userId]);

  if (user.rows[0].referral_stack_balance < amount) {
    return res.json({ ok: false, error: "Not enough referral NXN" });
  }

  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "STAKE_ACTIVE") {
    return res.json({ ok: false, error: "Stake closed" });
  }

  await query("BEGIN");

  await query(`
    UPDATE users
    SET referral_stack_balance = referral_stack_balance - $1
    WHERE telegram_id = $2::text
  `, [amount, userId]);

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
  `, [cycle.id, userId, amount]);

  await query("COMMIT");

  res.json({ ok: true });
});


// ================= SUBSCRIPTION CHECK =================

router.get("/subscribe/access/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await query(
      "SELECT subscribe_bonus_claimed FROM users WHERE telegram_id = $1",
      [userId]
    );

    if (!user.rows.length) {
      return res.json({ subscribed: false });
    }

    // ❗ твоя функция проверки подписки
    const subscribed = await checkSubscription(userId);

    res.json({
      subscribed,
      bonusClaimed: user.rows[0].subscribe_bonus_claimed
    });
  } catch (e) {
    console.error("SUB ACCESS ERROR", e);
    res.json({ subscribed: false });
  }
});


router.post("/subscribe/confirm", async (req, res) => {
  try {
    const { userId } = req.body;

    const userRes = await query(
      "SELECT balance, subscribe_bonus_claimed FROM users WHERE telegram_id = $1",
      [userId]
    );

    if (!userRes.rows.length) {
      return res.json({ ok: false });
    }

    const user = userRes.rows[0];

    const subscribed = await checkSubscription(userId);

    // ❌ если не подписан — не пускаем
    if (!subscribed) {
      return res.json({ ok: false });
    }

    // 🎁 бонус только ОДИН раз
    if (!user.subscribe_bonus_claimed) {
      await query(
        `UPDATE users
         SET balance = balance + 3000,
             subscribe_bonus_claimed = true
         WHERE telegram_id = $1`,
        [userId]
      );

      return res.json({ ok: true, bonus: 3000 });
    }

    // подписан, но бонус уже получал
    res.json({ ok: true, bonus: 0 });
  } catch (e) {
    console.error("SUB CONFIRM ERROR", e);
    res.json({ ok: false });
  }
});



// ================= TASKS =================

// state
router.get("/tasks/state/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userRes = await query(`
      SELECT task_tg_claimed, task_x_claimed
      FROM users
      WHERE telegram_id = $1::text
    `, [userId]);

    if (userRes.rowCount === 0) {
      return res.json({ ok: false });
    }

    res.json({
      ok: true,
      telegram: {
        claimed: !!userRes.rows[0].task_tg_claimed
      },
      twitter: {
        claimed: !!userRes.rows[0].task_x_claimed
      }
    });
  } catch (e) {
    console.error("TASK STATE ERROR", e);
    res.json({ ok: false });
  }
});


// telegram task claim
router.post("/tasks/telegram/claim", async (req, res) => {
  try {
    const { userId } = req.body;

    const userRes = await query(`
      SELECT task_tg_claimed
      FROM users
      WHERE telegram_id = $1::text
    `, [userId]);

    if (userRes.rowCount === 0) {
      return res.json({ ok: false, error: "User not found" });
    }

    if (userRes.rows[0].task_tg_claimed) {
      return res.json({ ok: false, error: "Reward already claimed" });
    }

    const subscribed = await checkSubscription(userId);

    if (!subscribed) {
      return res.json({ ok: false, error: "Subscription not found" });
    }

    await query(`
      UPDATE users
      SET balance = balance + 5000,
          task_tg_claimed = true
      WHERE telegram_id = $1::text
    `, [userId]);

    res.json({ ok: true, reward: 5000 });
  } catch (e) {
    console.error("TG TASK CLAIM ERROR", e);
    res.json({ ok: false, error: "Task claim failed" });
  }
});


// x task temporary manual off
router.post("/tasks/twitter/claim", async (req, res) => {
  try {
    const { userId } = req.body;

    const userRes = await query(`
      SELECT task_x_claimed
      FROM users
      WHERE telegram_id = $1::text
    `, [userId]);

    if (userRes.rowCount === 0) {
      return res.json({ ok: false, error: "User not found" });
    }

    if (userRes.rows[0].task_x_claimed) {
      return res.json({ ok: false, error: "Already claimed" });
    }

    // 💰 даём награду без проверки
    await query(`
      UPDATE users
      SET balance = balance + 5000,
          task_x_claimed = true
      WHERE telegram_id = $1::text
    `, [userId]);

    res.json({ ok: true, reward: 5000 });

  } catch (e) {
    console.error("X TASK ERROR", e);
    res.json({ ok: false });
  }
});


// GET daily state
router.get("/daily/state/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userRes = await query(`
      SELECT daily_day, daily_last_claim_at
      FROM users
      WHERE telegram_id = $1::text
    `, [userId]);

    if (userRes.rowCount === 0) {
      return res.json({ ok: false, error: "User not found" });
    }

    let day = Number(userRes.rows[0].daily_day || 1);
    const lastClaimAt = userRes.rows[0].daily_last_claim_at
      ? new Date(userRes.rows[0].daily_last_claim_at)
      : null;

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    if (lastClaimAt) {
      const diff = now.getTime() - lastClaimAt.getTime();

      if (diff >= oneDay * 2) {
        day = 1;
      }
    }

    const reward = getDailyReward(day);

    let canClaim = false;
    let nextClaimInMs = 0;

    if (!lastClaimAt) {
      canClaim = true;
    } else {
      const diff = now.getTime() - lastClaimAt.getTime();

      if (diff >= oneDay) {
        canClaim = true;
      } else {
        nextClaimInMs = oneDay - diff;
      }
    }

    res.json({
      ok: true,
      day,
      canClaim,
      nextClaimInMs,
      rewardLabel: reward.label
    });
  } catch (err) {
    console.error("daily state error", err);
    res.json({ ok: false, error: "Daily unavailable" });
  }
});


router.post("/daily/claim", async (req, res) => {
  try {
    const userId = String(req.body.userId || req.body.id || "");

    if (!userId) {
      return res.json({ ok: false, error: "Missing userId" });
    }

    const userRes = await query(`
      SELECT
        daily_day,
        daily_last_claim_at,
        balance,
        tap_boost_until,
        energy_boost_until,
        autoclicker_until
      FROM users
      WHERE telegram_id = $1::text
    `, [userId]);

    if (userRes.rowCount === 0) {
      return res.json({ ok: false, error: "User not found" });
    }

    let dailyDay = Number(userRes.rows[0].daily_day || 1);
    const lastClaimAt = userRes.rows[0].daily_last_claim_at
      ? new Date(userRes.rows[0].daily_last_claim_at)
      : null;

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    if (lastClaimAt) {
      const diff = now.getTime() - lastClaimAt.getTime();

      if (diff < oneDay) {
        return res.json({ ok: false, error: "Daily reward not ready yet" });
      }

      if (diff >= oneDay * 2) {
        dailyDay = 1;
      }
    }

    const reward = getDailyReward(dailyDay);

    let nextDay = dailyDay + 1;
    if (nextDay > 28) nextDay = 1;

    if (reward.type === "nix") {
      await query(`
        UPDATE users
        SET
          balance = balance + $1,
          daily_day = $2,
          daily_last_claim_at = NOW()
        WHERE telegram_id = $3::text
      `, [reward.value, nextDay, userId]);
    }

    else if (reward.type === "tap") {
      await query(`
        UPDATE users
        SET
          tap_boost_until = GREATEST(COALESCE(tap_boost_until, NOW()), NOW()) + INTERVAL '24 hours',
          daily_day = $1,
          daily_last_claim_at = NOW()
        WHERE telegram_id = $2::text
      `, [nextDay, userId]);
    }

    else if (reward.type === "energy") {
      await query(`
        UPDATE users
        SET
          energy_boost_until = GREATEST(COALESCE(energy_boost_until, NOW()), NOW()) + INTERVAL '24 hours',
          daily_day = $1,
          daily_last_claim_at = NOW()
        WHERE telegram_id = $2::text
      `, [nextDay, userId]);
    }

    else if (reward.type === "autoclicker") {
      await query(`
        UPDATE users
        SET
          autoclicker_until = GREATEST(COALESCE(autoclicker_until, NOW()), NOW()) + INTERVAL '10 hours',
          daily_day = $1,
          daily_last_claim_at = NOW()
        WHERE telegram_id = $2::text
      `, [nextDay, userId]);
    }

    return res.json({
      ok: true,
      day: dailyDay,
      rewardLabel: reward.label
    });
  } catch (err) {
    console.error("daily claim error", err);
    return res.json({ ok: false, error: "Daily claim failed" });
  }
});



const DAILY_REWARDS = {
  1:  { type: "nix", value: 500,  label: "500 NXN" },
  2:  { type: "nix", value: 750,  label: "750 NXN" },
  3:  { type: "nix", value: 1000, label: "1,000 NXN" },
  4:  { type: "nix", value: 1250, label: "1,250 NXN" },
  5:  { type: "nix", value: 1500, label: "1,500 NXN" },
  6:  { type: "tap", value: 2, hours: 24, label: "TAP +2 · 24h" },

  7:  { type: "nix", value: 500,  label: "500 NXN" },
  8:  { type: "nix", value: 750,  label: "750 NXN" },
  9:  { type: "nix", value: 1000, label: "1,000 NXN" },
  10: { type: "nix", value: 1250, label: "1,250 NXN" },
  11: { type: "nix", value: 1500, label: "1,500 NXN" },
  12: { type: "energy", value: 200, hours: 24, label: "ENERGY +200 · 24h" },

  13: { type: "nix", value: 1000, label: "1,000 NXN" },
  14: { type: "nix", value: 1250, label: "1,250 NXN" },
  15: { type: "nix", value: 1500, label: "1,500 NXN" },
  16: { type: "nix", value: 2000, label: "2,000 NXN" },
  17: { type: "nix", value: 1000, label: "1,000 NXN" },
  18: { type: "nix", value: 1250, label: "1,250 NXN" },
  19: { type: "nix", value: 1500, label: "1,500 NXN" },
  20: { type: "nix", value: 2000, label: "2,000 NXN" },
  21: { type: "nix", value: 1000, label: "1,000 NXN" },
  22: { type: "nix", value: 1250, label: "1,250 NXN" },
  23: { type: "nix", value: 1500, label: "1,500 NXN" },
  24: { type: "nix", value: 2000, label: "2,000 NXN" },
  25: { type: "nix", value: 1000, label: "1,000 NXN" },
  26: { type: "nix", value: 1250, label: "1,250 NXN" },
  27: { type: "nix", value: 1500, label: "1,500 NXN" },
  28: { type: "autoclicker", hours: 10, label: "AUTOCLICKER · 10h" }
};

function getDailyReward(day) {
  return DAILY_REWARDS[day] || DAILY_REWARDS[1];
}



export { checkRewardCycle, runAutoclickers };

export default router;

