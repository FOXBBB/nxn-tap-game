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
let maxEnergy = Number(localStorage.getItem(key("maxEnergy")) || 100);
let energy = Number(localStorage.getItem(key("energy")) || maxEnergy);
let lastEnergyTime = Number(localStorage.getItem(key("lastEnergyTime")) || Date.now());

// ================= SAVE / UI =================
function saveState() {
  localStorage.setItem(key("balance"), balance);
  localStorage.setItem(key("tapPower"), tapPower);
  localStorage.setItem(key("maxEnergy"), maxEnergy);
  localStorage.setItem(key("energy"), energy);
  localStorage.setItem(key("lastEnergyTime"), Date.now());
}

function updateUI() {
  const b = document.getElementById("balance");
  const e = document.getElementById("energy");
  if (b) b.textContent = "Balance: " + balance;
  if (e) e.textContent = `Energy: ${energy} / ${maxEnergy}`;
}

// ================= OFFLINE ENERGY REGEN =================
(function () {
  const now = Date.now();
  const diff = now - lastEnergyTime;
  const ticks = Math.floor(diff / 3000);
  if (ticks > 0) {
    energy = Math.min(maxEnergy, energy + ticks);
    saveState();
  }
})();

updateUI();

// ================= TAP (КАК БЫЛО) =================
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

// ================= SYNC USER =================
async function syncUser() {
  if (!tgUser) return;

  try {
    await fetch("/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tgUser.id,
        username: tgUser.username || "",
        first_name: tgUser.first_name || "",
        photo_url: tgUser.photo_url || "",
        balance
      })
    });
  } catch (e) {
    console.error("sync failed", e);
  }
}


// ================= LEADERBOARD (ПЕРЕЗАПИСЫВАЕМ ФЕЙКОВ) =================
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();
  if (!Array.isArray(data)) return;

  const placeholder = "avatar.png"; // ОДНА фиксированная картинка

  // TOP 1
  if (data[0]) {
    document.querySelector(".lb-top1 .name").innerText = data[0].name;
    document.querySelector(".lb-top1 .score").innerText = data[0].balance;
    document.querySelector(".lb-top1 .avatar").src = data[0].avatar || placeholder;
  }

  // TOP 2 / 3
  const cards = document.querySelectorAll(".lb-top23 .lb-card");

  if (data[1] && cards[0]) {
    cards[0].querySelector(".name").innerText = data[1].name;
    cards[0].querySelector(".score").innerText = data[1].balance;
    cards[0].querySelector(".avatar").src = data[1].avatar || placeholder;
  }

  if (data[2] && cards[1]) {
    cards[1].querySelector(".name").innerText = data[2].name;
    cards[1].querySelector(".score").innerText = data[2].balance;
    cards[1].querySelector(".avatar").src = data[2].avatar || placeholder;
  }

  // TOP 4–10
  const list = document.querySelector(".lb-list");
  list.innerHTML = "";

  data.slice(3).forEach((u, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>#${i + 4}</span>
      <img src="${u.avatar || placeholder}">
      <b>${u.name}</b>
      <i>${u.balance}</i>
    `;
    list.appendChild(row);
  });
}

// ================= MENU (КАК БЫЛО) =================
document.querySelectorAll(".menu div").forEach(btn => 
  btn.onclick = () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(btn.dataset.go).classList.remove("hidden");
  if (btn.dataset.go === "leaderboard") {
  syncUser();       // <-- сначала отправляем себя
  loadLeaderboard(); // <-- потом грузим топ
}
;
});

// старт
loadState();
updateUI();
syncUser(); // <-- ВАЖНО

window.addEventListener("load", () => {
  syncUser();
});
