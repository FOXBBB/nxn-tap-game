// ===== TELEGRAM WEBAPP =====
let tgUser = null;
let userId = "guest";

if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();

  tgUser = Telegram.WebApp.initDataUnsafe?.user;

  if (tgUser) {
    userId = String(tgUser.id);
    localStorage.setItem("tg_user", JSON.stringify({
      id: tgUser.id,
      username: tgUser.username || "",
      first_name: tgUser.first_name || "",
      photo_url: tgUser.photo_url || ""
    }));
  }
}

// ===== GAME STATE (PERSISTENT) =====
let balance = Number(localStorage.getItem("balance") || 0);
let tapPower = Number(localStorage.getItem("tapPower") || 1);
let maxEnergy = Number(localStorage.getItem("maxEnergy") || 100);
let energy = Number(localStorage.getItem("energy") || maxEnergy);

// ===== SAVE / LOAD =====
function getKey(key) {
  return `${userId}_${key}`;
}

function saveState() {
  localStorage.setItem(getKey("balance"), balance);
  localStorage.setItem(getKey("tapPower"), tapPower);
  localStorage.setItem(getKey("maxEnergy"), maxEnergy);
  localStorage.setItem(getKey("energy"), energy);
}

function loadState() {
  balance = Number(localStorage.getItem(getKey("balance")) || balance);
  tapPower = Number(localStorage.getItem(getKey("tapPower")) || tapPower);
  maxEnergy = Number(localStorage.getItem(getKey("maxEnergy")) || maxEnergy);
  energy = Number(localStorage.getItem(getKey("energy")) || energy);
}


function updateUI() {
  const balanceEl = document.getElementById("balance");
  const energyEl = document.getElementById("energy");
  if (balanceEl) balanceEl.textContent = "Balance: " + balance;
  if (energyEl) energyEl.textContent = `Energy: ${energy} / ${maxEnergy}`;
}

loadState();
updateUI();


// ===== NAVIGATION =====
const screens = ["leaderboard", "tap", "transfer", "shop"];

document.querySelectorAll(".menu div").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".menu div").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    screens.forEach(s => document.getElementById(s).classList.add("hidden"));
    const screen = document.getElementById(btn.dataset.go);
    screen.classList.remove("hidden");

    // 👇 ВАЖНО: если открыли leaderboard — грузим данные
    if (btn.dataset.go === "leaderboard") {
      loadLeaderboard();
    }
  };
});

// ===== TAP =====
const coin = document.getElementById("coin");

coin.onclick = (e) => {
  if (energy <= 0) return;

  balance += tapPower;
  energy -= 1;

  saveState();
  updateUI();

  // +1 animation
  const plus = document.createElement("div");
  plus.innerText = `+${tapPower}`;
  plus.className = "plus-one";
  plus.style.left = e.clientX + "px";
  plus.style.top = e.clientY + "px";
  document.body.appendChild(plus);

  setTimeout(() => plus.remove(), 900);
};

// ===== ENERGY REGEN =====
setInterval(() => {
  if (energy < maxEnergy) {
    energy += 1;
    saveState();
    updateUI();
  }
}, 3000);

// ===== TRANSFER (UI DEMO) =====
const sendBtn = document.getElementById("send");
const idInput = document.querySelector("#transfer input");
const amountInput = document.querySelectorAll("#transfer input")[1];

sendBtn.onclick = () => {
  const recipientId = idInput.value.trim();
  const amount = parseInt(amountInput.value);

  if (!recipientId || isNaN(amount) || amount <= 0) {
    alert("Enter valid ID and amount");
    return;
  }

  if (balance < amount) {
    alert("Not enough balance");
    return;
  }

  balance -= amount;
  saveState();
  updateUI();

  alert(`Sent ${amount} NXN to ID ${recipientId}`);
};

// ===== SHOP (NXN ONLY) =====
const purchased = JSON.parse(localStorage.getItem("purchased") || "{}");

function savePurchased() {
  localStorage.setItem("purchased", JSON.stringify(purchased));
}

document.querySelectorAll(".shop-buy").forEach(btn => {
  btn.onclick = () => {
    const text = btn.innerText;

    // TAP +1
    if (text === "10 000 NXN") {
      if (purchased.tap1) return alert("Already purchased");
      if (balance < 10000) return alert("Not enough NXN");

      balance -= 10000;
      tapPower += 1;
      purchased.tap1 = true;

      saveState();
      savePurchased();
      updateUI();

      alert("Tap Power +1 activated");
    }

    // ENERGY +100
    if (text === "20 000 NXN") {
      if (purchased.energy100) return alert("Already purchased");
      if (balance < 20000) return alert("Not enough NXN");

      balance -= 20000;
      maxEnergy += 100;
      energy += 100;
      purchased.energy100 = true;

      saveState();
      savePurchased();
      updateUI();

      alert("Energy +100 activated");
    }
  };
});
// ===== TON TEMPORARY UPGRADES (30 DAYS) =====
const TON_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 дней

let tonUpgrades = JSON.parse(localStorage.getItem("tonUpgrades") || "{}");

function saveTonUpgrades() {
  localStorage.setItem("tonUpgrades", JSON.stringify(tonUpgrades));
}

function isActive(upg) {
  return tonUpgrades[upg] && tonUpgrades[upg] > Date.now();
}

function activateUpgrade(name, applyFn) {
  tonUpgrades[name] = Date.now() + TON_DURATION;
  saveTonUpgrades();
  applyFn();
  updateUI();
}

// применяем активные апгрейды при загрузке
function applyTonUpgrades() {
  if (isActive("tap5")) tapPower += 5;
  if (isActive("tap10")) tapPower += 10;
  if (isActive("energy200")) maxEnergy += 200;
  if (isActive("energy500")) maxEnergy += 500;
}
applyTonUpgrades();
updateUI();

// обработка покупок TON (mock)
document.querySelectorAll(".shop-buy").forEach(btn => {
  btn.addEventListener("click", () => {
    const text = btn.innerText;

    // Tap +5 (0.2 TON)
    if (text === "0.2 TON" && btn.previousElementSibling?.querySelector(".shop-name")?.innerText.includes("Tap Power +5")) {
      if (isActive("tap5")) return alert("Already active");
      activateUpgrade("tap5", () => tapPower += 5);
      alert("Tap +5 activated for 30 days");
    }

    // Tap +10 (0.5 TON)
    if (text === "0.5 TON" && btn.previousElementSibling?.querySelector(".shop-name")?.innerText.includes("Tap Power +10")) {
      if (isActive("tap10")) return alert("Already active");
      activateUpgrade("tap10", () => tapPower += 10);
      alert("Tap +10 activated for 30 days");
    }

    // Energy +200 (0.2 TON)
    if (text === "0.2 TON" && btn.previousElementSibling?.querySelector(".shop-name")?.innerText.includes("Energy +200")) {
      if (isActive("energy200")) return alert("Already active");
      activateUpgrade("energy200", () => maxEnergy += 200);
      alert("Energy +200 activated for 30 days");
    }

    // Energy +500 (0.5 TON)
    if (text === "0.5 TON" && btn.previousElementSibling?.querySelector(".shop-name")?.innerText.includes("Energy +500")) {
      if (isActive("energy500")) return alert("Already active");
      activateUpgrade("energy500", () => maxEnergy += 500);
      alert("Energy +500 activated for 30 days");
    }

    // Autoclicker (1 TON)
    if (text === "1 TON") {
      if (isActive("autoclicker")) return alert("Already active");
      activateUpgrade("autoclicker", () => {
        setInterval(() => {
          if (energy > 0) {
            balance += tapPower;
            energy -= 1;
            saveState();
            updateUI();
          }
        }, 2000);
      });
      alert("Autoclicker activated for 30 days");
    }
  });
});
// ===== AUTCLICKER (OFFLINE SAFE) =====
const AUTOCLICK_INTERVAL = 2000; // 1 клик / 2 секунды
const AUTOCLICK_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 дней

let autoclickerUntil = Number(localStorage.getItem("autoclickerUntil") || 0);
let lastActiveTime = Number(localStorage.getItem("lastActiveTime") || Date.now());

function isAutoclickerActive() {
  return autoclickerUntil > Date.now();
}

// начисление оффлайн-кликов
function applyOfflineAutoclicks() {
  if (!isAutoclickerActive()) return;

  const now = Date.now();
  const diff = now - lastActiveTime;
  const clicks = Math.floor(diff / AUTOCLICK_INTERVAL);

  if (clicks > 0) {
    balance += clicks * tapPower;
saveState();
updateUI();

  }
}

// вызываем при загрузке
applyOfflineAutoclicks();

// онлайн-клики (пока пользователь в игре)
setInterval(() => {
  if (!isAutoclickerActive()) return;
  if (energy <= 0) return;

  balance += tapPower;
  saveState();
  updateUI();
}, AUTOCLICK_INTERVAL);

// сохраняем время выхода
window.addEventListener("beforeunload", () => {
  localStorage.setItem("lastActiveTime", Date.now());
});

// активация автокликера (mock TON)
function activateAutoclicker() {
  autoclickerUntil = Date.now() + AUTOCLICK_DURATION;
  localStorage.setItem("autoclickerUntil", autoclickerUntil);
  localStorage.setItem("lastActiveTime", Date.now());
  alert("Autoclicker activated for 30 days");
}

// вешаем на кнопку 1 TON
document.querySelectorAll(".shop-buy").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.innerText === "1 TON") {
      if (isAutoclickerActive()) {
        alert("Autoclicker already active");
        return;
      }
      activateAutoclicker();
    }
  });
});
if (tgUser) {
  alert("Telegram user: " + tgUser.id);
} else {
  alert("Opened NOT from Telegram");
}
// ===== LOAD LEADERBOARD =====
async function loadLeaderboard() {
  try {
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
        <img src="${u.avatar || 'https://i.pravatar.cc/50'}">
        <b>${u.name}</b>
        <i>${(u.balance / 1000).toFixed(1)}K</i>
      `;
      list.appendChild(row);
    });
  } catch (e) {
    console.error("Leaderboard error", e);
  }
}

// обновляем при открытии экрана
document.querySelector('[data-go="leaderboard"]').onclick = () => {
  loadLeaderboard();
};
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
// ===== FORCE MENU FIX =====
document.querySelectorAll(".menu div").forEach(btn => {
  btn.addEventListener("click", () => {
    console.log("CLICK:", btn.dataset.go);

    document.querySelectorAll(".screen").forEach(s => {
      s.classList.add("hidden");
    });

    const target = document.getElementById(btn.dataset.go);
    if (!target) {
      console.error("SCREEN NOT FOUND:", btn.dataset.go);
      return;
    }

    target.classList.remove("hidden");

    document.querySelectorAll(".menu div").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.go === "leaderboard") {
      console.log("LOADING LEADERBOARD");
      loadLeaderboard();
    }
  });
});
