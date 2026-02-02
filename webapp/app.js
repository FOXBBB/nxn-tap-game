// ================= TELEGRAM =================
let tgUser = null;
let userId = "guest";

if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  tgUser = Telegram.WebApp.initDataUnsafe?.user;
  if (tgUser) userId = String(tgUser.id);
}

// ================= STORAGE =================
const key = (k) => `${userId}_${k}`;

// ================= GAME STATE =================
let balance = Number(localStorage.getItem(key("balance")) || 0);
let tapPower = Number(localStorage.getItem(key("tapPower")) || 1);

let baseMaxEnergy = Number(localStorage.getItem(key("baseMaxEnergy")) || 100);
let maxEnergy = baseMaxEnergy;
let energy = Number(localStorage.getItem(key("energy")) || baseMaxEnergy);

let lastEnergyTime = Number(localStorage.getItem(key("lastEnergyTime")) || Date.now());

// ================= SAVE =================
function saveState() {
  localStorage.setItem(key("balance"), balance);
  localStorage.setItem(key("tapPower"), tapPower);
  localStorage.setItem(key("baseMaxEnergy"), baseMaxEnergy);
  localStorage.setItem(key("energy"), energy);
}

function updateUI() {
  const b = document.getElementById("balance");
  const e = document.getElementById("energy");
  if (b) b.textContent = "Balance: " + balance;
  if (e) e.textContent = `Energy: ${energy} / ${maxEnergy}`;
}

// ================= TON UPGRADES =================
const TON_DURATION = 30 * 24 * 60 * 60 * 1000;
let ton = JSON.parse(localStorage.getItem(key("ton")) || "{}");

function isActive(name) {
  return ton[name] && ton[name] > Date.now();
}

function activate(name) {
  ton[name] = Date.now() + TON_DURATION;
  localStorage.setItem(key("ton"), JSON.stringify(ton));
}

// ================= RECALC ENERGY =================
function recalcMaxEnergy() {
  maxEnergy = baseMaxEnergy;
  if (isActive("energy200")) maxEnergy += 200;
  if (isActive("energy500")) maxEnergy += 500;
  if (energy > maxEnergy) energy = maxEnergy;
}

// ================= OFFLINE ENERGY REGEN =================
function applyOfflineEnergy() {
  const now = Date.now();
  const diff = now - lastEnergyTime;
  const ticks = Math.floor(diff / 3000);

  if (ticks > 0) {
    energy = Math.min(maxEnergy, energy + ticks);
    saveState();
  }

  lastEnergyTime = now;
  localStorage.setItem(key("lastEnergyTime"), now);
}

// ================= INIT =================
recalcMaxEnergy();
applyOfflineEnergy();
updateUI();

// ================= NAVIGATION =================
const screens = ["leaderboard", "tap", "transfer", "shop"];

document.querySelectorAll(".menu div").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".menu div").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    screens.forEach(s => document.getElementById(s).classList.add("hidden"));
    document.getElementById(btn.dataset.go).classList.remove("hidden");

    if (btn.dataset.go === "leaderboard") loadLeaderboard();
  };
});

// ================= TAP =================
document.getElementById("coin").onclick = (e) => {
  if (energy <= 0) return;

  balance += tapPower;
  energy -= 1;

  saveState();
  updateUI();
  syncUser();

  const plus = document.createElement("div");
  plus.className = "plus-one";
  plus.innerText = `+${tapPower}`;
  plus.style.left = e.clientX + "px";
  plus.style.top = e.clientY + "px";
  document.body.appendChild(plus);
  setTimeout(() => plus.remove(), 900);
};

// ================= ONLINE ENERGY =================
setInterval(() => {
  if (energy < maxEnergy) {
    energy++;
    saveState();
    updateUI();
  }
}, 3000);

// ================= TRANSFER =================
document.getElementById("send").onclick = () => {
  const inputs = document.querySelectorAll("#transfer input");
  const id = inputs[0].value.trim();
  const amount = parseInt(inputs[1].value);

  if (!id || isNaN(amount) || amount <= 0) return alert("Invalid data");
  if (balance < amount) return alert("Not enough balance");

  balance -= amount;
  saveState();
  updateUI();
  syncUser();

  alert("Transfer completed");
};

// ================= SHOP (NXN PERMANENT) =================
const purchased = JSON.parse(localStorage.getItem(key("purchased")) || {});
function savePurchased() {
  localStorage.setItem(key("purchased"), JSON.stringify(purchased));
}

document.querySelectorAll(".shop-buy").forEach(btn => {
  btn.onclick = () => {
    const label = btn.innerText;

    if (label === "10 000 NXN" && !purchased.tap1) {
      if (balance < 10000) return alert("Not enough NXN");
      balance -= 10000;
      tapPower += 1;
      purchased.tap1 = true;
    }

    if (label === "20 000 NXN" && !purchased.energy100) {
      if (balance < 20000) return alert("Not enough NXN");
      balance -= 20000;
      baseMaxEnergy += 100;
      energy += 100;
      purchased.energy100 = true;
      recalcMaxEnergy();
    }

    savePurchased();
    saveState();
    updateUI();
    syncUser();
  };
});

// ================= AUTCLICKER =================
let autoclickerUntil = Number(localStorage.getItem(key("autoclickerUntil")) || 0);
let lastVisit = Number(localStorage.getItem(key("lastVisit")) || Date.now());

function autoclickerActive() {
  return autoclickerUntil > Date.now();
}

function applyOfflineAutoclick() {
  if (!autoclickerActive()) return;

  const diff = Date.now() - lastVisit;
  const clicks = Math.floor(diff / 2000);
  if (clicks > 0) {
    balance += clicks * tapPower;
    saveState();
    syncUser();
  }

  localStorage.setItem(key("lastVisit"), Date.now());
}

applyOfflineAutoclick();

setInterval(() => {
  if (!autoclickerActive()) return;
  balance += tapPower;
  saveState();
  updateUI();
  syncUser();
}, 2000);

// ================= LEADERBOARD (REAL TOP-10) =================
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();

  // TOP-1 / 2 / 3
  if (data[0]) fillTop(1, data[0]);
  if (data[1]) fillTop(2, data[1]);
  if (data[2]) fillTop(3, data[2]);

  // 4–10
  const list = document.querySelector(".lb-list");
  if (!list) return;
  list.innerHTML = "";

  data.slice(3).forEach((u, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>#${i + 4}</span>
      <img src="${u.avatar || "https://i.pravatar.cc/50"}">
      <b>${u.name}</b>
      <i>${u.balance}</i>
    `;
    list.appendChild(row);
  });
}

function fillTop(pos, user) {
  document.querySelector(`.top${pos}-name`).textContent = user.name;
  document.querySelector(`.top${pos}-score`).textContent = user.balance;
  document.querySelector(`.top${pos}-avatar`).src =
    user.avatar || "https://i.pravatar.cc/100";
}

// ================= SYNC =================
async function syncUser() {
  if (!tgUser) return;

  await fetch("/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
      photo_url: tgUser.photo_url,
      balance
    })
  });
}

// first sync
syncUser();

// ================= EXIT =================
window.addEventListener("beforeunload", () => {
  localStorage.setItem(key("lastEnergyTime"), Date.now());
  localStorage.setItem(key("lastVisit"), Date.now());
});
