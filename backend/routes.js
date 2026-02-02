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


//transfer//
router.post("/transfer", (req, res) => {
  let { fromId, toId, amount } = req.body;

  // 🔒 нормализация
  fromId = String(fromId);
  toId = String(toId);
  amount = Number(amount);

  if (!fromId || !toId || !amount || amount <= 0) {
    return res.json({ ok: false, error: "Invalid transfer data" });
  }

  const db = loadDB();
  if (!db.transfers) db.transfers = [];

  const sender = db.users.find(u => String(u.id) === fromId);
  const receiver = db.users.find(u => String(u.id) === toId);

  if (!sender) {
    return res.json({ ok: false, error: "Sender not found" });
  }

  if (!receiver) {
    return res.json({ ok: false, error: "Receiver not found" });
  }

  if (sender.balance < amount) {
    return res.json({ ok: false, error: "Not enough balance" });
  }

  // 💸 комиссия 10%
  const fee = Math.floor(amount * 0.1);
  const received = amount - fee;

  // 💥 списываем и начисляем
  sender.balance -= amount;
  receiver.balance += received;

  // 🧾 лог
  db.transfers.push({
    fromId,
    toId,
    amount,
    fee,
    received,
    time: Date.now()
  });

  saveDB(db);

  // ✅ ВАЖНО: возвращаем received
  res.json({
    ok: true,
    received,
    balance: sender.balance
  });
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
