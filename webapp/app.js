let tgUser = null;
let userId = "guest";

if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  tgUser = Telegram.WebApp.initDataUnsafe?.user;
  if (tgUser) userId = String(tgUser.id);
}

// ===== GAME STATE =====
let balance = 0;
let tapPower = 1;
let maxEnergy = 100;
let energy = 100;

// ===== UI =====
function updateUI() {
  document.getElementById("balance").innerText = "Balance: " + balance;
  document.getElementById("energy").innerText = `Energy: ${energy} / ${maxEnergy}`;
}

// ===== TAP =====
document.getElementById("coin").onclick = () => {
  if (energy <= 0) return;
  balance += tapPower;
  energy -= 1;
  updateUI();
  syncUser();
};

// ===== ENERGY REGEN =====
setInterval(() => {
  if (energy < maxEnergy) {
    energy += 1;
    updateUI();
  }
}, 3000);

// ===== SYNC USER =====
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

// ===== LEADERBOARD =====
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();

  if (!Array.isArray(data)) return;

  // TOP 1
  if (data[0]) {
    document.querySelector(".lb-top1 .name").innerText = data[0].name;
    document.querySelector(".lb-top1 .score").innerText = format(data[0].balance);
    document.querySelector(".lb-top1 .avatar").src = data[0].avatar || "https://i.pravatar.cc/120";
  }

  const cards = document.querySelectorAll(".lb-top23 .lb-card");
  if (data[1]) {
    cards[0].querySelector(".name").innerText = data[1].name;
    cards[0].querySelector(".score").innerText = format(data[1].balance);
    cards[0].querySelector(".avatar").src = data[1].avatar || "https://i.pravatar.cc/100";
  }
  if (data[2]) {
    cards[1].querySelector(".name").innerText = data[2].name;
    cards[1].querySelector(".score").innerText = format(data[2].balance);
    cards[1].querySelector(".avatar").src = data[2].avatar || "https://i.pravatar.cc/100";
  }

  const list = document.querySelector(".lb-list");
  list.innerHTML = "";

  data.slice(3).forEach((u, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>#${i + 4}</span>
      <img src="${u.avatar || "https://i.pravatar.cc/50"}">
      <b>${u.name}</b>
      <i>${format(u.balance)}</i>
    `;
    list.appendChild(row);
  });
}

function format(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n;
}

// ===== MENU =====
document.querySelectorAll(".menu div").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(btn.dataset.go).classList.remove("hidden");
    if (btn.dataset.go === "leaderboard") loadLeaderboard();
  };
});

// старт
updateUI();
syncUser();
