import express from "express";
import { loadDB, saveDB } from "./db.js";

const router = express.Router();

/* ===== GET ME ===== */
router.get("/me/:id", (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => String(u.id) === String(req.params.id));
  if (!user) return res.json({ balance: 0 });
  res.json(user);
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
    saveDB(db);
  }

  res.json({ ok: true });
});

/* ===== TAP ===== */
router.post("/tap", (req, res) => {
  const { id, tapPower } = req.body;
  const db = loadDB();

  const user = db.users.find(u => String(u.id) === String(id));
  if (!user) return res.json({ ok: false });

  user.balance += tapPower;
  saveDB(db);

  res.json({ ok: true, balance: user.balance });
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
