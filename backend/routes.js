import express from "express";
import { query } from "./db.js";

const router = express.Router();

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
    SELECT balance, energy, max_energy, tap_power
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

/* ===== TAP ===== */
router.post("/tap", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ ok: false });

  await applyEnergyRegen(id);


  const result = await query(


    `
    UPDATE users
    SET
      balance = balance + tap_power,
      energy = GREATEST(energy - 1, 0)
    WHERE telegram_id = $1
    RETURNING balance, energy, max_energy, tap_power
    `,
    [String(id)]
  );

  if (result.rowCount === 0) {
    return res.json({ ok: false });
  }

  const u = result.rows[0];

  res.json({
    ok: true,
    balance: Number(u.balance),
    energy: Number(u.energy),
    maxEnergy: Number(u.max_energy),
    tapPower: Number(u.tap_power)
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
    if (balance < price) {
      return res.json({ ok: false, error: "Not enough NXN" });
    }

    tap_power += 1;
  }

  else if (itemId === "energy_plus_100") {
    price = 50000;
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


export default router;
