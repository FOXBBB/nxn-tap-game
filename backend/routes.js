import express from "express";
import { loadDB, saveDB } from "./db.js";

const router = express.Router();
const TON_RECEIVER = "UQDg0qiBTFbmCc6OIaeCSF0tL6eSX8cC56PYTF44Ob8hDqWf";
const TON_PRICES = {
  tap_plus_3: 0.2,
  energy_plus_300: 0.5,
  autoclicker_30d: 1
};

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
 if (user.energy === undefined || user.energy === null) {
  user.energy = 100;
} else {
  user.energy = Number(user.energy);
}
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
  balance: 0,
  energy: 100,
  maxEnergy: 100,
  tapPower: 1
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

 // HARD BLOCK TAP AT ZERO ENERGY
if (user.energy <= 0) {
  return res.json({
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

router.post("/ton-confirm", (req, res) => {
  const { userId, itemId, txHash } = req.body;

  if (!userId || !itemId || !txHash) {
    return res.json({ ok: false, error: "Invalid data" });
  }

  const db = loadDB();
  const user = db.users.find(u => String(u.id) === String(userId));
  if (!user) return res.json({ ok: false });

  if (!user.tonPurchases) user.tonPurchases = {};

  // защита от повторного применения
  if (user.tonPurchases[itemId] && user.tonPurchases[itemId] > Date.now()) {
    return res.json({ ok: false, error: "Already active" });
  }

  const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // 🎯 АКТИВАЦИЯ
  if (itemId === "tap_plus_3") {
    user.tapPower += 3;
    user.tonPurchases[itemId] = now + DAYS_30;
  }

  if (itemId === "energy_300") {
    user.maxEnergy += 300;
    user.tonPurchases[itemId] = now + DAYS_30;
  }

  if (itemId === "autoclicker") {
    user.autoclickerUntil = now + DAYS_30;
    user.tonPurchases[itemId] = now + DAYS_30;
  }

  saveDB(db);
  res.json({ ok: true });
});


export default router;
/* ===== BUY FOR NXN ===== */
router.post("/buy-nxn", (req, res) => {
  const { id, itemId } = req.body;
  if (!id || !itemId) return res.json({ ok: false });

  const db = loadDB();
  const user = db.users.find(u => String(u.id) === String(id));
  if (!user) return res.json({ ok: false, error: "User not found" });

  // init defaults
  user.balance = Number(user.balance) || 0;
  user.tapPower = Number(user.tapPower) || 1;
  user.maxEnergy = Number(user.maxEnergy) || 100;
  user.upgrades = user.upgrades || {};

  // SHOP ITEMS (NXN)
  const items = {
    tap_plus_1: {
      price: 30000,
      once: true,
      apply: () => {
        user.tapPower += 1;
      }
    },
    energy_plus_100: {
      price: 50000,
      once: true,
      apply: () => {
        user.maxEnergy += 100;
        user.energy = Math.min(user.energy + 100, user.maxEnergy);
      }
    }
  };

  const item = items[itemId];
  if (!item) return res.json({ ok: false, error: "Unknown item" });

  // already bought?
  if (item.once && user.upgrades[itemId]) {
    return res.json({ ok: false, error: "Already purchased" });
  }

  // balance check
  if (user.balance < item.price) {
    return res.json({ ok: false, error: "Not enough NXN" });
  }

  // apply purchase
  user.balance -= item.price;
  item.apply();
  user.upgrades[itemId] = true;

  saveDB(db);

  res.json({
    ok: true,
    balance: user.balance,
    tapPower: user.tapPower,
    maxEnergy: user.maxEnergy
  });
});
/* ===== BUY FOR TON (30 DAYS) ===== */
router.post("/buy-ton", async (req, res) => {
  const { id, itemId, txHash } = req.body;
  if (!id || !itemId || !txHash) {
    return res.json({ ok: false, error: "Invalid request" });
  }

  const db = loadDB();
  const user = db.users.find(u => String(u.id) === String(id));
  if (!user) return res.json({ ok: false, error: "User not found" });

  user.tonUpgrades = user.tonUpgrades || {};

  const now = Date.now();
  const duration = 30 * 24 * 60 * 60 * 1000; // 30 days

  // init or extend
  if (!user.tonUpgrades[itemId] || user.tonUpgrades[itemId] < now) {
    user.tonUpgrades[itemId] = now + duration;
  } else {
    user.tonUpgrades[itemId] += duration;
  }

  // APPLY EFFECTS (SERVER SOURCE OF TRUTH)
  if (itemId === "tap_plus_3") {
    user.tapPower = Math.max(user.tapPower || 1, 4);
  }

  if (itemId === "energy_plus_300") {
    user.maxEnergy = Math.max(user.maxEnergy || 100, 400);
    user.energy = user.maxEnergy;
  }

  if (itemId === "autoclicker_30d") {
    user.autoclickerUntil = user.tonUpgrades[itemId];
  }

  saveDB(db);

  res.json({ ok: true, expiresAt: user.tonUpgrades[itemId] });
});
