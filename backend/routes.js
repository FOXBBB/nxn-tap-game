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
      balance: 0
    };
    db.users.push(user);
  }

  user.balance = balance;
  saveDB(db);

  res.json({ ok: true });
});

/* ===== LEADERBOARD ===== */
router.get("/leaderboard", (req, res) => {
  const db = loadDB();

  const top = db.users
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);

  res.json(top);
});

export default router;
