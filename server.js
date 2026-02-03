const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================== MIDDLEWARE ================== */
app.use(express.json());
app.use(express.static("webapp"));

/* ================== USERS STORAGE ================== */
const USERS_FILE = path.join(__dirname, "data", "users.json");

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getUser(userId) {
  const users = loadUsers();

  if (!users[userId]) {
    users[userId] = {
      id: userId,
      balance: 0,
      energy: 100,
      maxEnergy: 100,
      tapPower: 1,
      createdAt: Date.now()
    };
    saveUsers(users);
  }

  return users[userId];
}

/* ================== GET USER ================== */
app.get("/me/:id", (req, res) => {
  const user = getUser(req.params.id);
  res.json(user);
});

/* ================== TAP ================== */
app.post("/tap", (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ ok: false });

  const users = loadUsers();
  const user = getUser(id);

  if (user.energy <= 0) {
    return res.json(user);
  }

  user.energy -= 1;
  user.balance += user.tapPower;

  users[id] = user;
  saveUsers(users);

  res.json(user);
});

/* ================== TRANSFER ================== */
app.post("/transfer", (req, res) => {
  const { fromId, toId, amount } = req.body;
  const MIN_TRANSFER = 100;

  if (!fromId || !toId) {
    return res.json({ ok: false, error: "INVALID USER ID" });
  }

  if (!amount || amount < MIN_TRANSFER) {
    return res.json({ ok: false, error: "MIN TRANSFER = 100 NXN" });
  }

  const users = loadUsers();
  const fromUser = getUser(fromId);
  const toUser = getUser(toId);

  if (fromUser.balance < amount) {
    return res.json({ ok: false, error: "NOT ENOUGH BALANCE" });
  }

  fromUser.balance -= amount;
  toUser.balance += amount;

  users[fromId] = fromUser;
  users[toId] = toUser;
  saveUsers(users);

  res.json({
    ok: true,
    balance: fromUser.balance
  });
});


/* ================== START SERVER ================== */
app.listen(PORT, () => {
  console.log("NXN server running on port", PORT);
});
