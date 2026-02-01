// ===== USER ID (PERSISTENT) =====
let userId = localStorage.getItem("nxn_user_id");

if (!userId) {
  userId = Date.now().toString();
  localStorage.setItem("nxn_user_id", userId);
}

// ===== STATE =====
let currentUser = null;

// ===== DOM =====
const statsEl = document.getElementById("stats");
const coinEl = document.getElementById("coin");
const sendBtn = document.getElementById("sendBtn");

// ===== UPDATE UI (SAFE) =====
function updateUI(user) {
  if (!user) return;

  currentUser = user;

  const balance = user.balance ?? 0;
  const energy = user.energy ?? 0;
  const maxEnergy = user.max_energy ?? 0;
  const tapPower = user.tap_power ?? 1;

  statsEl.innerText =
    `Balance: ${balance} | Energy: ${energy}/${maxEnergy} | Tap +${tapPower}`;
}

// ===== INIT USER =====
async function initUser() {
  try {
    const res = await fetch("/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId })
    });

    const user = await res.json();
    updateUI(user);
  } catch (e) {
    statsEl.innerText = "Connection error";
    console.error(e);
  }
}

// ===== TAP =====
async function tap() {
  if (!currentUser) return;

  if (currentUser.energy <= 0) {
    // энергия 0 — просто ждём реген
    return;
  }

  const res = await fetch("/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId })
  });

  const user = await res.json();
  updateUI(user);
}

// ===== TRANSFER =====
async function transfer() {
  const to = document.getElementById("toId").value;
  const amount = Number(document.getElementById("amount").value);

  await fetch("/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: userId,
      to,
      amount
    })
  });
}

// ===== EVENTS =====
coinEl.addEventListener("click", tap);
sendBtn.addEventListener("click", transfer);

// ===== AUTO ENERGY REFRESH =====
setInterval(initUser, 3000);

// ===== START =====
initUser();
