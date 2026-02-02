import express from "express";
import { loadDB, saveDB } from "./db.js";

const router = express.Router();

// ===== SYNC USER =====
router.post("/sync", (req, res) => {
  try {
    const { id, username, first_name, photo_url, balance } = req.body;
    if (!id) return res.json({ ok: false });

    const db = loadDB();
    if (!Array.isArray(db.users)) db.users = [];

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

    user.balance = Number(balance) || 0;
    saveDB(db);

    res.json({ ok: true });
  } catch (e) {
    console.error("SYNC ERROR", e);
    res.status(500).json({ ok: false });
  }
});

// ===== TRANSFER =====
router.post("/transfer", (req, res) => {
  try {
    const { fromId, toId, amount } = req.body;

    if (!fromId || !toId || !amount) {
      return res.status(400).json({ ok: false, error: "Invalid data" });
    }

    const db = loadDB();
    if (!Array.isArray(db.users)) db.users = [];

    const fromUser = db.users.find(u => String(u.id) === String(fromId));
    const toUser = db.users.find(u => String(u.id) === String(toId));

    if (!fromUser) {
      return res.status(404).json({ ok: false, error: "Sender not found" });
    }

    if (!toUser) {
      return res.status(404).json({ ok: false, error: "Recipient not found" });
    }

    if (fromUser.balance < amount) {
      return res.status(400).json({ ok: false, error: "Not enough balance" });
    }

    fromUser.balance -= amount;
    toUser.balance += amount;

    saveDB(db);

    res.json({ ok: true });
  } catch (e) {
    console.error("TRANSFER ERROR", e);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ===== LEADERBOARD =====
router.get("/leaderboard", (req, res) => {
  try {
    const db = loadDB();
    if (!Array.isArray(db.users)) return res.json([]);

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
router.get("/me/:id", (req, res) => {
  try {
    const { id } = req.params;
    const db = loadDB();

    const user = db.users.find(u => String(u.id) === String(id));
    if (!user) return res.status(404).json({});

    res.json(user);
  } catch (e) {
    res.status(500).json({});
  }
});
