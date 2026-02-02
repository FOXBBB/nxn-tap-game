import express from "express";
import { loadDB, saveDB } from "./db.js";

const router = express.Router();

/**
 * SYNC USER (called from Telegram WebApp)
 */
router.post("/sync", (req, res) => {
  const { id, username, first_name, photo_url, balance } = req.body;

  if (!id) return res.json({ ok: false });

  const db = loadDB();

  db.users[id] = {
    id,
    name: username || first_name || `User${id}`,
    avatar: photo_url || "",
    balance: Number(balance) || 0,
    updated: Date.now()
  };

  saveDB(db);
  res.json({ ok: true });
});

/**
 * REAL LEADERBOARD
 */
router.get("/leaderboard", (req, res) => {
  const db = loadDB();

  const users = Object.values(db.users || {})
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);

  res.json(users);
});

export default router;
