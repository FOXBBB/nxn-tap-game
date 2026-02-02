// ================= TELEGRAM =================
let tgUser = null;
let userId = "guest";

// ================= STORAGE =================
const key = (k) => `${userId}_${k}`;

// ================= GAME STATE =================
let balance = 0;
let tapPower = 1;
let maxEnergy = 100;
let energy = 100;
let lastEnergyTime = Date.now();

// ================= SAVE / LOAD =================
function saveState() {
  localStorage.setItem(key("balance"), balance);
  localStorage.setItem(key("tapPower"), tapPower);
  localStorage.setItem(key("maxEnergy"), maxEnergy);
  localStorage.setItem(key("energy"), energy);
  localStorage.setItem(key("lastEnergyTime"), Date.now());
}

function loadState() {
  balance = Number(localStorage.getItem(key("balance")) || 0);
  tapPower = Number(localStorage.getItem(key("tapPower")) || 1);
  maxEnergy = Number(localStorage.getItem(key("maxEnergy")) || 100);
  energy = Number(localStorage.getItem(key("energy")) || maxEnergy);
  lastEnergyTime = Number(localStorage.getItem(key("lastEnergyTime")) || Date.now());
}

// ================= UI =================
function updateUI() {
  const b = document.getElementById("balance");
  const e = document.getElementById("energy");
  if (b) b.textContent = "Balance: " + balance;
  if (e) e.textContent = `Energy: ${energy} / ${maxEnergy}`;
}

// ================= SYNC USER =================
async function syncUser() {
  if (!tgUser) return;
  try {
    await fetch("/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: String(tgUser.id),
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

// ================= INIT TELEGRAM =================
document.addEventListener("DOMContentLoaded", () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    tgUser = Telegram.WebApp.initDataUnsafe?.user;

    if (tgUser) {
      userId = String(tgUser.id);

      // показать свой ID
      const myIdEl = document.getElementById("my-id");
      if (myIdEl) {
        myIdEl.textContent = "Your ID: " + userId;
        myIdEl.onclick = () => {
          navigator.clipboard.writeText(userId);
          Telegram.WebApp.showPopup({
            title: "Copied",
            message: "Your ID copied"
          });
        };
      }
    }

    // ⬇️ ВАЖНО: только теперь работаем с данными
    loadState();

    // офлайн-реген энергии
    const diff = Date.now() - lastEnergyTime;
    const ticks = Math.floor(diff / 3000);
    if (ticks > 0) {
      energy = Math.min(maxEnergy, energy + ticks);
    }

    updateUI();
    syncUser();
  }
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
const sendBtn = document.getElementById("send");

sendBtn.onclick = async () => {
  const toId = document.getElementById("to-id")?.value.trim();
  const amount = parseInt(document.getElementById("amount")?.value);

  if (!toId || isNaN(amount) || amount <= 0) {
    alert("Enter valid recipient ID and amount");
    return;
  }

  try {
    const res = await fetch("/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromId: userId, toId, amount })
    });

    const data = await res.json();
    if (!data.ok) return alert(data.error || "Transfer failed");

    balance -= amount;
    saveState();
    updateUI();
    syncUser();

    alert("Transfer successful");
  } catch (e) {
    alert("Transfer error");
  }
};

// ================= LEADERBOARD =================
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();
  if (!Array.isArray(data)) return;

  const placeholder = "avatar.png";

  if (data[0]) {
    document.querySelector(".lb-top1 .name").innerText = data[0].name;
    document.querySelector(".lb-top1 .score").innerText = data[0].balance;
    document.querySelector(".lb-top1 .avatar").src = data[0].avatar || placeholder;
  }

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

// ================= MENU =================
document.querySelectorAll(".menu div").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(btn.dataset.go).classList.remove("hidden");

    if (btn.dataset.go === "leaderboard") {
      syncUser();
      loadLeaderboard();
    }
  };
});
