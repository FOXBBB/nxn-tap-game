// ================= TELEGRAM =================
let tgUser = null;
let userId = null;

// ================= GAME STATE (ONLY FROM SERVER) =================
let balance = 0;
let energy = 0;
let maxEnergy = 100;
let tapPower = 1;
let canTap = false;


// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.Telegram || !Telegram.WebApp) {
    alert("Open app from Telegram");
    return;
  }

  Telegram.WebApp.ready();
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

canTap = energy > 0;
updateUI();

}


// ================= UI =================
function updateUI() {
  const b = document.getElementById("balance");
  const e = document.getElementById("energy");

  if (b) b.innerText = "Balance: " + balance;
  if (e) e.innerText = `Energy: ${energy} / ${maxEnergy}`;
  if (energy <= 5) {
  e.classList.add("energy-low");
} else {
  e.classList.remove("energy-low");
}
}





// ================= TAP =================
const coin = document.getElementById("coin");
coin.onclick = async (e) => {
  if (!canTap) return;

  try {
    const res = await fetch("/tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId })
    });

    const data = await res.json();

    // баланс берём из tap — это безопасно
    balance = Number(data.balance) || balance;

    // ❗ энергию ИЗ TAP НЕ БЕРЁМ ВООБЩЕ
    // energy обновляется ТОЛЬКО через /me

    updateUI();
    animatePlus(e, tapPower);
  } catch (err) {
    console.error("tap error", err);
  }
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
      alert(data.error || "Transfer failed");
      return;
    }

    await refreshMe();
    updateUI();

    alert(`Sent ${data.sent} NXN (10% burned)`);
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

  } catch {}
}, 3000);

