let tgUser = null;
let userId = null;

// UI state
let balance = 0;
let energy = 0;
let maxEnergy = 100;
let tapPower = 1;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.Telegram || !Telegram.WebApp) {
    alert("Open from Telegram");
    return;
  }

  Telegram.WebApp.ready();
  tgUser = Telegram.WebApp.initDataUnsafe.user;
  userId = String(tgUser.id);

  // show my ID
  const myId = document.getElementById("my-id");
  if (myId) myId.innerText = "Your ID: " + userId;

  // register user
  await fetch("/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: userId,
      username: tgUser.username,
      first_name: tgUser.first_name,
      photo_url: tgUser.photo_url
    })
  });

  await refreshMe();
  updateUI();
  initMenu();
});

// ================= TAP =================
document.getElementById("coin").onclick = async (e) => {
  const res = await fetch("/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId })
  });

  const data = await res.json();
  if (!data.ok) return;

  balance = data.balance;
  energy = data.energy;
  maxEnergy = data.maxEnergy;

  updateUI();
  animatePlus(e);
};

// ================= TRANSFER =================
document.getElementById("send").onclick = async () => {
  const toId = document.getElementById("to-id").value.trim();
  const amount = Number(document.getElementById("amount").value);

  if (!toId || amount <= 0) {
    alert("Invalid data");
    return;
  }

  const res = await fetch("/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromId: userId, toId, amount })
  });

  const data = await res.json();
  if (!data.ok) return alert(data.error);

  await refreshMe();
  alert(`Sent ${data.sent} NXN (10% burned)`);
};

// ================= LEADERBOARD =================
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();
  if (!Array.isArray(data)) return;

  // ТВОЙ UI уже есть — просто данные
  console.log("LEADERBOARD:", data);
}

// ================= HELPERS =================
async function refreshMe() {
  const res = await fetch(`/me/${userId}`);
  const data = await res.json();

  balance = data.balance;
  energy = data.energy;
  maxEnergy = data.maxEnergy;
  tapPower = data.tapPower;

  updateUI();
}

function updateUI() {
  document.getElementById("balance").innerText = "Balance: " + balance;
  document.getElementById("energy").innerText = `Energy: ${energy}/${maxEnergy}`;
}

function animatePlus(e) {
  const plus = document.createElement("div");
  plus.className = "plus-one";
  plus.innerText = `+${tapPower}`;
  plus.style.left = e.clientX + "px";
  plus.style.top = e.clientY + "px";
  document.body.appendChild(plus);
  setTimeout(() => plus.remove(), 800);
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

      if (btn.dataset.go === "leaderboard") {
        loadLeaderboard();
      }
    };
  });
}

// ================= KEEP ONLINE =================
setInterval(() => {
  if (!tgUser) return;

  fetch("/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: userId,
      username: tgUser.username,
      first_name: tgUser.first_name,
      photo_url: tgUser.photo_url
    })
  });
}, 5000);
