const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================== MIDDLEWARE ================== */
app.use(express.json());
app.use(express.static("webapp"));

/* ================== POSTGRES ================== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

/* ================== INIT DB ================== */
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      balance BIGINT DEFAULT 0,
      energy INT DEFAULT 100,
      max_energy INT DEFAULT 100,
      tap_power INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

/* ================== HELPERS ================== */
async function getUser(id) {
  const res = await pool.query(
    "SELECT * FROM users WHERE id=$1",
    [id]
  );

  if (res.rows.length) return res.rows[0];

  const user = await pool.query(
    `INSERT INTO users (id) VALUES ($1) RETURNING *`,
    [id]
  );

  return user.rows[0];
}

/* ================== ROUTES ================== */

app.post("/sync", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ ok: false });
  await getUser(id);
  res.json({ ok: true });
});

app.get("/me/:id", async (req, res) => {
  const user = await getUser(req.params.id);
  res.json({
    balance: Number(user.balance),
    energy: user.energy,
    maxEnergy: user.max_energy,
    tapPower: user.tap_power
  });
});

app.post("/tap", async (req, res) => {
  const { id } = req.body;
  const user = await getUser(id);

  if (user.energy <= 0) {
    return res.json({
      balance: Number(user.balance),
      energy: user.energy,
      maxEnergy: user.max_energy,
      tapPower: user.tap_power
    });
  }

  const updated = await pool.query(
    `UPDATE users
     SET energy = energy - 1,
         balance = balance + tap_power
     WHERE id=$1
     RETURNING *`,
    [id]
  );

  const u = updated.rows[0];

  res.json({
    balance: Number(u.balance),
    energy: u.energy,
    maxEnergy: u.max_energy,
    tapPower: u.tap_power
  });
});

app.post("/transfer", async (req, res) => {
  const { fromId, toId, amount } = req.body;
  const MIN = 100;
  const FEE = 0.1;

  if (!fromId || !toId || amount < MIN) {
    return res.json({ ok: false, error: "MIN TRANSFER 100" });
  }

  const sender = await getUser(fromId);
  if (Number(sender.balance) < amount) {
    return res.json({ ok: false, error: "NOT ENOUGH BALANCE" });
  }

  const received = Math.floor(amount * (1 - FEE));
  const burned = amount - received;

  await pool.query("BEGIN");

  try {
    await pool.query(
      "UPDATE users SET balance = balance - $1 WHERE id=$2",
      [amount, fromId]
    );

    await pool.query(
      "UPDATE users SET balance = balance + $1 WHERE id=$2",
      [received, toId]
    );

    await pool.query("COMMIT");

    res.json({
      ok: true,
      balance: Number(sender.balance) - amount,
      received,
      burned
    });

  } catch (e) {
    await pool.query("ROLLBACK");
    res.json({ ok: false, error: "TRANSFER FAILED" });
  }
});

/* ================== START ================== */
app.listen(PORT, () => {
  console.log("NXN server running");
});
