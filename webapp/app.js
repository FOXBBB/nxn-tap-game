// ================= TELEGRAM =================
let tgUser = null;
let userId = null;

// ================= GAME STATE (ONLY FROM SERVER) =================
let balance = 0;
let energy = 0;
let maxEnergy = 100;
let tapPower = 1;
let canTap = false;
let tonConnectUI = null;



// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.Telegram || !Telegram.WebApp) {
    alert("Open app from Telegram");
    return;
  }

  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  Telegram.WebApp.enableClosingConfirmation();
  Telegram.WebApp.setHeaderColor("#02040a");
  Telegram.WebApp.setBackgroundColor("#02040a");

  tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://nxn-tap-game.onrender.com/tonconnect-manifest.json"
  });


  tgUser = Telegram.WebApp.initDataUnsafe.user;
  userId = String(tgUser.id);

  // show my id
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

  // register / update user
  await syncUser();

  // get actual state
  await refreshMe();
  updateUI();
  initMenu();
});

// ================= SERVER SYNC =================
async function syncUser() {
  if (!tgUser) return;

  await fetch("/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: userId,
      username: tgUser.username || "",
      first_name: tgUser.first_name || "",
      photo_url: tgUser.photo_url || ""
    })
  });
}

// ================= LOAD MY STATE =================
async function refreshMe() {
  const res = await fetch(`/me/${userId}`);
  const data = await res.json();

  energy = Number(data.energy) || 0;
  maxEnergy = Number(data.maxEnergy) || 100;
  tapPower = Number(data.tapPower) || tapPower;

  canTap = energy > 0;
  updateUI();


}


// ================= UI =================
function updateUI() {
  const b = document.getElementById("balance");
  const e = document.getElementById("energy");

const value = document.querySelector(".balance-value");
if (value) value.innerText = formatNumber(balance);

  if (e) e.innerText = `Energy: ${energy} / ${maxEnergy}`;
  if (energy <= 5) {
    e.classList.add("energy-low");
  } else {
    e.classList.remove("energy-low");
  }
}


const coin = document.getElementById("coin");

function animateCoinHit() {
  coin.classList.add("hit");
  coin.classList.add("glow");

  setTimeout(() => {
    coin.classList.remove("hit");
    coin.classList.remove("glow");
  }, 120);
}


// ================= TAP =================
coin.onclick = async (e) => {
  if (energy <= 0) return;

  animateCoinHit();

  // дальше логика тапа (как у тебя сейчас)


  // optimistic UI
  energy -= 1;
  balance += tapPower;
  updateUI();

  try {
    const res = await fetch("/tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId })
    });

    const data = await res.json();

    balance = Number(data.balance) || balance;
    energy = Number(data.energy) || energy;
    maxEnergy = Number(data.maxEnergy) || maxEnergy;
    tapPower = Number(data.tapPower) || tapPower;

    updateUI();
  } catch (err) {
    console.error("tap error", err);
  }

  animatePlus(e, tapPower);
};







function animatePlus(e, value) {
  const plus = document.createElement("div");
  plus.className = "plus-one";
  plus.innerText = `+${value}`;
  plus.style.left = e.clientX + "px";
  plus.style.top = e.clientY - 10 + "px";
  document.body.appendChild(plus);
  setTimeout(() => plus.remove(), 800);
}

// ================= TRANSFER =================
document.getElementById("send").onclick = async () => {
  const btn = document.getElementById("send");
  btn.disabled = true;

  try {
    const toId = document.getElementById("to-id")?.value.trim();
    const amount = Number(document.getElementById("amount")?.value);

    if (!toId || amount <= 0) {
      alert("Enter valid ID and amount");
      return;
    }

    const res = await fetch("/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromId: userId,
        toId,
        amount
      })
    });

    const data = await res.json();
    if (!data.ok) {
      const box = document.querySelector(".transfer-box");
      if (box) {
        box.classList.add("transfer-error");
        setTimeout(() => box.classList.remove("transfer-error"), 450);
      }

      const toast = document.createElement("div");
      toast.className = "transfer-toast error";
      toast.innerText = data.error || "TRANSFER FAILED";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1600);

      return;
    }


    await refreshMe();
    updateUI();

    // ===== TRANSFER SUCCESS UI =====
    const box = document.querySelector(".transfer-box");
    if (box) {
      box.classList.add("transfer-success");
      setTimeout(() => box.classList.remove("transfer-success"), 600);
    }
    // burn animation
    const burn = document.createElement("div");
    burn.className = "plus-one";
    burn.innerText = "-10% BURNED";
    burn.style.color = "#ff6b6b";
    burn.style.textShadow = "0 0 10px rgba(255,80,80,0.8)";
    burn.style.left = "50%";
    burn.style.top = "60%";
    burn.style.transform = "translateX(-50%)";
    document.body.appendChild(burn);
    setTimeout(() => burn.remove(), 900);


    // toast message
    const toast = document.createElement("div");
    toast.className = "transfer-toast";
    toast.innerText = "TRANSFER SUCCESS ✓";
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 1600);

  } finally {
    // 🔒 ВСЕГДА возвращаем кнопку
    btn.disabled = false;
  }
};

// ===== LOAD TRANSFER HISTORY =====
async function loadHistory() {
  if (!userId) return;

  const res = await fetch(`/history/${userId}`);
  const data = await res.json();

  const box = document.getElementById("history");
  if (!box) return;

  box.innerHTML = "";

  if (!data.length) {
    box.innerHTML = "<i>No transfers yet</i>";
    return;
  }

  data.forEach(t => {
    const row = document.createElement("div");
    row.className = "history-row";

    // подсветка свежих (меньше 5 сек)
    if (Date.now() - t.time < 5000) {
      row.classList.add("new");
    }


    const dir = t.fromId === userId ? "Sent to" : "Received from";
    const arrow = t.fromId === userId ? "→" : "←";
    const otherId = t.fromId === userId ? t.toId : t.fromId;
    const sign = t.fromId === userId ? "-" : "+";

    row.innerHTML = `
  <b>${arrow} ${dir} ID ${otherId}</b>
  <span>${sign}${t.received} NXN</span>
  <i>${new Date(t.time).toLocaleDateString()}</i>
`;


    box.appendChild(row);
  });
}

// ===== HISTORY TOGGLE =====
const toggle = document.getElementById("history-toggle");
const historyBox = document.getElementById("history");

if (toggle && historyBox) {
  toggle.onclick = () => {
    historyBox.classList.toggle("hidden");
    toggle.innerText = historyBox.classList.contains("hidden")
      ? "Transfer history ⬇️"
      : "Transfer history ⬆️";

    if (!historyBox.classList.contains("hidden")) {
      loadHistory();
    }
  };
}



// ================= LEADERBOARD =================
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();
  if (!Array.isArray(data)) return;

  const placeholder = "avatar.png";

  // TOP 1
  if (data[0]) {
    document.querySelector(".lb-top1 .name").innerText = data[0].name;
    document.querySelector(".lb-top1 .score").innerText = data[0].balance;
    document.querySelector(".lb-top1 .avatar").src =
      data[0].avatar || placeholder;
  }

  // TOP 2 / 3
  const cards = document.querySelectorAll(".lb-top23 .lb-card");

  if (data[1] && cards[0]) {
    cards[0].querySelector(".name").innerText = data[1].name;
    cards[0].querySelector(".score").innerText = data[1].balance;
    cards[0].querySelector(".avatar").src =
      data[1].avatar || placeholder;
  }

  if (data[2] && cards[1]) {
    cards[1].querySelector(".name").innerText = data[2].name;
    cards[1].querySelector(".score").innerText = data[2].balance;
    cards[1].querySelector(".avatar").src =
      data[2].avatar || placeholder;
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

// ================= MENU =================
function initMenu() {
  document.querySelectorAll(".menu div").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".screen").forEach(s =>
        s.classList.add("hidden")
      );

      const target = document.getElementById(btn.dataset.go);
      if (target) target.classList.remove("hidden");

      document.querySelectorAll(".menu div").forEach(b =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

      if (btn.dataset.go === "transfer") {
        loadHistory();
      }


      if (btn.dataset.go === "leaderboard") {
        loadLeaderboard();

      }
    };
  });
}

// ================= KEEP USER ONLINE =================
setInterval(() => {
  syncUser();
}, 5000);
// ================= ENERGY SYNC TICK =================
// pulls real energy from server so regen is visible without taps
setInterval(async () => {
  if (!userId) return;

  try {
    const res = await fetch(`/me/${userId}`);
    const data = await res.json();

    energy = Number(data.energy) || energy;
    maxEnergy = Number(data.maxEnergy) || maxEnergy;
    canTap = energy > 0;
    updateUI();

  } catch { }
}, 3000);



// ===== STAR FIELD (FALLING, SAFE) =====
const stars = document.getElementById("stars");

if (stars) {
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("span");

    const size = Math.random() * 2 + 1;
    s.style.width = size + "px";
    s.style.height = size + "px";

    s.style.left = Math.random() * 100 + "vw";
    s.style.top = Math.random() * 100 + "vh";

    s.style.opacity = Math.random() * 0.6 + 0.2;
    s.style.animationDuration = 8 + Math.random() * 12 + "s";
    s.style.animationDelay = Math.random() * 10 + "s";

    stars.appendChild(s);
  }
}
async function buyNXN(itemId) {
  try {
    const res = await fetch("/buy-nxn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        itemId
      })
    });

    const data = await res.json();
    if (!data.ok) {
      alert(data.error || "Purchase failed");
      return;
    }

    // обновляем состояние
    balance = data.balance;
    tapPower = data.tapPower;
    maxEnergy = data.maxEnergy;

    updateUI();
    alert("Purchased successfully!");
  } catch (e) {
    console.error(e);
  }
}

async function payTON(amountTon, itemId) {
  if (!tonConnectUI) {
    alert("TON not ready");
    return;
  }

  if (!tonConnectUI.connected) {
    await tonConnectUI.openModal();
    return;
  }

  const amountNano = Math.floor(amountTon * 1e9).toString();

  try {
    const tx = await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: "UQDg0qiBTFbmCc6OIaeCSF0tL6eSX8cC56PYTF44Ob8hDqWf",
          amount: amountNano
        }
      ]
    });

    // UI receipt
    const receipt = document.createElement("div");
    receipt.className = "transfer-toast";
    receipt.innerText = "TON PAYMENT SENT ✓";
    document.body.appendChild(receipt);
    setTimeout(() => receipt.remove(), 1600);

    // подтверждение на сервер
    await fetch("/ton-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        itemId,
        txHash: tx.boc
      })
    });

    // обновляем состояние
    await refreshMe();
    updateUI();

  } catch (e) {
    console.error("TON ERROR", e);
    alert("Payment cancelled or failed");
  }
}




// ================= FORMAT LARGE NUMBERS =================
function formatNumber(n) {
  n = Number(n) || 0;

  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(".0", "") + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(".0", "") + "K";
  return n.toString();
}