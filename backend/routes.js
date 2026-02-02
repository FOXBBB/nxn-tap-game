import express from "express";
import { loadDB, saveDB } from "./db.js";

const router = express.Router();

/* ===== GET ME ===== */
router.get("/me/:id", (req, res) => {
  const { id } = req.params;

  const db = loadDB();
  let user = db.users.find(u => String(u.id) === String(id));

  if (!user) {
    return res.json({
      balance: 0,
      energy: 100,
      maxEnergy: 100,
      tapPower: 1
    });
  }

  // 🔒 гарантируем значения
  user.balance = Number(user.balance) || 0;
  user.energy = Number(user.energy) || 100;
  user.maxEnergy = Number(user.maxEnergy) || 100;
  user.tapPower = Number(user.tapPower) || 1;

  saveDB(db);

  res.json({
    balance: user.balance,
    energy: user.energy,
    maxEnergy: user.maxEnergy,
    tapPower: user.tapPower
  });
});


/* ===== SYNC USER (CREATE ONLY) ===== */
router.post("/sync", (req, res) => {
  const { id, username, first_name, photo_url } = req.body;
  if (!id) return res.json({ ok: false });

  const db = loadDB();

  let user = db.users.find(u => String(u.id) === String(id));

  if (!user) {
    user = {
      id: String(id),
      name: username || first_name || "User",
      avatar: photo_url || "",
      balance: 0
    };
    db.users.push(user);
  }

  saveDB(db);
  res.json({ ok: true });
});


/* ===== TAP ===== */
router.post("/tap", (req, res) => {
  const { id } = req.body;
  const db = loadDB();

  const user = db.users.find(u => String(u.id) === String(id));
  if (!user) return res.json({ ok: false });

  if (user.energy <= 0) {
    return res.json({
      ok: true,
      balance: user.balance,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      tapPower: user.tapPower
    });
  }

  user.balance += user.tapPower;
  user.energy -= 1;

  saveDB(db);

  res.json({
    ok: true,
    balance: user.balance,
    energy: user.energy,
    maxEnergy: user.maxEnergy,
    tapPower: user.tapPower
  });
});


/* ===== TRANSFER (10% BURN) ===== */
router.post("/transfer", (req, res) => {
  const { fromId, toId, amount } = req.body;
  const db = loadDB();

  const from = db.users.find(u => String(u.id) === String(fromId));
  const to = db.users.find(u => String(u.id) === String(toId));

  if (!from) return res.json({ ok: false, error: "Sender not found" });
  if (!to) return res.json({ ok: false, error: "Recipient not found" });
  if (from.balance < amount) return res.json({ ok: false, error: "Not enough balance" });

  const fee = Math.floor(amount * 0.1);
  const received = amount - fee;

  from.balance -= amount;
  to.balance += received;

  saveDB(db);

  res.json({ ok: true, received, fee });
});
// ===== LOG TRANSFER =====
db.transfers.push({
  fromId: String(fromId),
  toId: String(toId),
  amount: amount,
  fee: Math.floor(amount * 0.1),
  received: amount - Math.floor(amount * 0.1),
  time: Date.now()
});
// ===== TRANSFER HISTORY =====
router.get("/history/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  const history = db.transfers
    .filter(t => t.fromId === id || t.toId === id)
    .slice(-20) // последние 20
    .reverse();

  res.json(history);
});


/* ===== LEADERBOARD ===== */
router.get("/leaderboard", (req, res) => {
  const db = loadDB();
  const top = db.users
    .slice()
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);
  res.json(top);
});

export default router;
