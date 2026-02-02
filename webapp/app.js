let tgUser = null;
let userId = null;
let balance = 0;
let energy = 100;
let maxEnergy = 100;
let tapPower = 1;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  Telegram.WebApp.ready();
  tgUser = Telegram.WebApp.initDataUnsafe.user;
  userId = String(tgUser.id);

  document.getElementById("my-id").innerText = "Your ID: " + userId;

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

  await refreshBalance();
  updateUI();
});

// ===== TAP =====
document.getElementById("coin").onclick = async (e) => {
  if (energy <= 0) return;

  energy--;
  updateUI();

  const res = await fetch("/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, tapPower })
  });

  const data = await res.json();
  balance = data.balance;
  updateUI();

  const plus = document.createElement("div");
  plus.className = "plus-one";
  plus.innerText = `+${tapPower}`;
  plus.style.left = e.clientX + "px";
  plus.style.top = e.clientY + "px";
  document.body.appendChild(plus);
  setTimeout(() => plus.remove(), 800);
};

// ===== ENERGY =====
setInterval(() => {
  if (energy < maxEnergy) {
    energy++;
    updateUI();
  }
}, 3000);

// ===== TRANSFER =====
document.getElementById("send").onclick = async () => {
  const toId = document.getElementById("to-id").value.trim();
  const amount = parseInt(document.getElementById("amount").value);

  const res = await fetch("/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromId: userId, toId, amount })
  });

  const data = await res.json();
  if (!data.ok) return alert(data.error);

  await refreshBalance();
  alert(`Sent ${data.received} NXN (fee burned)`);
};

// ===== LEADERBOARD =====
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();
  console.log(data); // UI ты уже сделал — тут всё ок
}

// ===== HELPERS =====
async function refreshBalance() {
  const res = await fetch(`/me/${userId}`);
  const data = await res.json();
  balance = data.balance || 0;
}

function updateUI() {
  document.getElementById("balance").innerText = "Balance: " + balance;
  document.getElementById("energy").innerText = `Energy: ${energy}/${maxEnergy}`;
}
