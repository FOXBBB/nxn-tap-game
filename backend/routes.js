import express from "express";
import { loadDB, saveDB } from "./db.js";

const router = express.Router();

router.post("/sync", (req, res) => {
  try {
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
  } catch (e) {
    console.error("SYNC ERROR", e);
    res.status(500).json({ ok: false });
  }
});

router.get("/leaderboard", (req, res) => {
  try {
    const db = loadDB();
    const top = db.users
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);

    res.json(top);
  } catch (e) {
    console.error("LEADERBOARD ERROR", e);
    res.status(500).json([]);
  }
});

export default router;
