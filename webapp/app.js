// ===== TELEGRAM WEBAPP =====
let tgUser = null;
let userId = "guest";

if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();
  tgUser = Telegram.WebApp.initDataUnsafe?.user;
  if (tgUser) userId = String(tgUser.id);
}

// ===== KEYS =====
const key = (k) => `${userId}_${k}`;

// ===== BASE GAME STATE =====
let balance = Number(localStorage.getItem(key("balance")) || 0);
let tapPower = Number(localStorage.getItem(key("tapPower")) || 1);

// БАЗОВАЯ энергия (меняется ТОЛЬКО покупками за NXN)
let baseMaxEnergy = Number(localStorage.getItem(key("baseMaxEnergy")) || 100);

// текущая энергия
let energy = Number(localStorage.getItem(key("energy")) || baseMaxEnergy);

// итоговый maxEnergy (пересчитывается)
let maxEnergy = baseMaxEnergy;

// ===== SAVE =====
function saveState() {
  localStorage.setItem(key("balance"), balance);
  localStorage.setItem(key("tapPower"), tapPower);
  localStorage.setItem(key("baseMaxEnergy"), baseMaxEnergy);
  localStorage.setItem(key("energy"), energy);
}

function updateUI() {
  document.getElementById("balance").textContent = "Balance: " + balance;
  document.getElementById("energy").textContent = `Energy: ${energy} / ${maxEnergy}`;
}

// ===== TON UPGRADES (30 DAYS) =====
const TON_DURATION = 30 * 24 * 60 * 60 * 1000;
let tonUpgrades = JSON.parse(localStorage.getItem(key("tonUpgrades")) || "{}");

function saveTonUpgrades() {
  localStorage.setItem(key("tonUpgrades"), JSON.stringify(tonUpgrades));
}

function isActive(name) {
  return tonUpgrades[name] && tonUpgrades[name] > Date.now();
}

function activateUpgrade(name) {
  tonUpgrades[name] = Date.now() + TON_DURATION;
  saveTonUpgrades();
}

// ===== RECALC ENERGY (CRITICAL FIX) =====
function recalcMaxEnergy() {
  maxEnergy = baseMaxEnergy;

  if (isActive("energy200")) maxEnergy += 200;
  if (isActive("energy500")) maxEnergy += 500;

  if (energy > maxEnergy) energy = maxEnergy;
}

// ===== INIT =====
recalcMaxEnergy();
updateUI();

// ===== NAVIGATION =====
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

// ===== TAP =====
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

// ===== ENERGY REGEN (SAFE) =====
let energyInterval = null;
if (!energyInterval) {
  energyInterval = setInterval(() => {
    if (energy < maxEnergy) {
      energy++;
      saveState();
      updateUI();
    }
  }, 3000);
}

// ===== AUTCLICKER (NO ENERGY USAGE) =====
const AUTOCLICK_INTERVAL = 2000;
let autoclickerUntil = Number(localStorage.getItem(key("autoclickerUntil")) || 0);
let lastVisit = Number(localStorage.getItem(key("lastVisit")) || Date.now());

function isAutoclickerActive() {
  return autoclickerUntil > Date.now();
}

function applyOfflineAutoclicks() {
  if (!isAutoclickerActive()) return;

  const now = Date.now();
  const diff = now - lastVisit;
  const clicks = Math.floor(diff / AUTOCLICK_INTERVAL);

  if (clicks > 0) {
    balance += clicks * tapPower;
    saveState();
    updateUI();
  }

  localStorage.setItem(key("lastVisit"), now);
}

applyOfflineAutoclicks();

setInterval(() => {
  if (!isAutoclickerActive()) return;
  balance += tapPower;
  saveState();
  updateUI();
  syncUser();
}, AUTOCLICK_INTERVAL);

window.addEventListener("beforeunload", () => {
  localStorage.setItem(key("lastVisit"), Date.now());
});

// ===== TRANSFER (LOCAL DEMO) =====
document.getElementById("send").onclick = () => {
  const inputs = document.querySelectorAll("#transfer input");
  const id = inputs[0].value.trim();
  const amount = parseInt(inputs[1].value);

  if (!id || isNaN(amount) || amount <= 0) return alert("Invalid data");
  if (balance < amount) return alert("Not enough balance");

  balance -= amount;
  saveState();
  updateUI();
  alert("Transfer complete");
};

// ===== SHOP (NXN PERMANENT) =====
const purchased = JSON.parse(localStorage.getItem(key("purchased")) || {});
function savePurchased() {
  localStorage.setItem(key("purchased"), JSON.stringify(purchased));
}

document.querySelectorAll(".shop-buy").forEach(btn => {
  btn.onclick = () => {
    const text = btn.innerText;

    // TAP +1 (NXN)
    if (text === "10 000 NXN" && !purchased.tap1) {
      if (balance < 10000) return alert("Not enough NXN");
      balance -= 10000;
      tapPower += 1;
      purchased.tap1 = true;
    }

    // ENERGY +100 (NXN)
    if (text === "20 000 NXN" && !purchased.energy100) {
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
  };
});

// ===== SHOP (TON TEMPORARY) =====
document.querySelectorAll(".shop-buy").forEach(btn => {
  btn.addEventListener("click", () => {

    if (btn.innerText === "0.2 TON" && btn.dataset.type === "energy200") {
      if (isActive("energy200")) return alert("Already active");
      activateUpgrade("energy200");
      recalcMaxEnergy();
    }

    if (btn.innerText === "0.5 TON" && btn.dataset.type === "energy500") {
      if (isActive("energy500")) return alert("Already active");
      activateUpgrade("energy500");
      recalcMaxEnergy();
    }

    if (btn.innerText === "1 TON") {
      if (isAutoclickerActive()) return alert("Autoclicker already active");
      autoclickerUntil = Date.now() + TON_DURATION;
      localStorage.setItem(key("autoclickerUntil"), autoclickerUntil);
      localStorage.setItem(key("lastVisit"), Date.now());
    }

    saveState();
    updateUI();
  });
});
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


// ===== LEADERBOARD (UI ONLY FOR NOW) =====
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();

  const list = document.querySelector(".lb-list");
  if (!list) return;

  list.innerHTML = "";

  data.slice(3).forEach((u, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>#${i + 4}</span>
      <img src="${u.photo_url || "https://i.pravatar.cc/50"}">
      <b>${u.username || u.first_name || "Player"}</b>
      <i>${u.balance}</i>
    `;
    list.appendChild(row);
  });
}

