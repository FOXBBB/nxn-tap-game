import express from "express";
import { loadDB, saveDB } from "./db.js";

const router = express.Router();

/* ===== SYNC USER ===== */
router.post("/sync", (req, res) => {
  const { id, username, first_name, photo_url, balance } = req.body;
  if (!id) return res.json({ ok: false });

  const db = loadDB();

  let user = db.users.find(u => u.id === id);

  if (!user) {
    user = {
      id,
      name: username || first_name || "User",
      avatar: photo_url || "",
      balance: balance || 0
    };
    db.users.push(user);
  }

  saveDB(db);

  res.json({
    ok: true,
    balance: user.balance
  });
});

/* ===== TRANSFER WITH 10% BURN ===== */
router.post("/transfer", (req, res) => {
  const { fromId, toId, amount } = req.body;

  if (!fromId || !toId || !amount || amount <= 0) {
    return res.json({ ok: false, error: "Invalid data" });
  }

  const db = loadDB();

  const from = db.users.find(u => u.id === fromId);
  const to = db.users.find(u => u.id === toId);

  if (!from) return res.json({ ok: false, error: "Sender not found" });
  if (!to) return res.json({ ok: false, error: "Recipient not found" });

  if (from.balance < amount) {
    return res.json({ ok: false, error: "Not enough balance" });
  }

  const fee = Math.floor(amount * 0.1);
  const received = amount - fee;

  // списываем полностью
  from.balance -= amount;

  // зачисляем с учётом комиссии
  to.balance += received;

  // 🔥 fee просто исчезает

  // история переводов (если ещё нет — создаём)
  if (!db.transfers) db.transfers = [];

  db.transfers.push({
    from: fromId,
    to: toId,
    amount,
    fee,
    received,
    time: Date.now()
  });

  saveDB(db);

  res.json({
    ok: true,
    fee,
    received
  });
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
