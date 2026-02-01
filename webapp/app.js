let userId = localStorage.getItem("nxn_user_id");
if (!userId) {
  userId = Date.now().toString();
  localStorage.setItem("nxn_user_id", userId);
}

let user = {
  balance: 0,
  energy: 100,
  maxEnergy: 100,
  tapPower: 1
};

const balanceEl = document.getElementById("balance");
const energyEl = document.getElementById("energy");
const coinEl = document.getElementById("coin");
const effectsEl = document.getElementById("tap-effects");

function updateUI() {
  balanceEl.innerText = `Balance: ${user.balance}`;
  energyEl.innerText = `Energy: ${user.energy} / ${user.maxEnergy}`;
}

/* ENERGY REGEN — каждые 3 сек */
setInterval(() => {
  if (user.energy < user.maxEnergy) {
    user.energy += 1;
    updateUI();
  }
}, 3000);

/* TAP */
coinEl.addEventListener("click", (e) => {
  if (user.energy <= 0) return;

  user.energy -= 1;
  user.balance += user.tapPower;

  spawnPlus(e.clientX, e.clientY, user.tapPower);
  updateUI();
});

function spawnPlus(x, y, value) {
  const el = document.createElement("div");
  el.className = "tap-plus";
  el.innerText = `+${value}`;
  el.style.left = x + "px";
  el.style.top = y + "px";
  effectsEl.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

updateUI();
async function loadLeaderboard() {
  const res = await fetch("/leaderboard");
  const data = await res.json();

  const list = document.getElementById("leaderboard");
  list.innerHTML = "";

  data.forEach((u, i) => {
    const row = document.createElement("div");
    row.innerHTML = `<span>#${i + 1}</span><span>${u.balance} NXN</span>`;
    list.appendChild(row);
  });

  // TOP 3
  const cards = document.querySelectorAll(".top-card");
  data.slice(0, 3).forEach((u, i) => {
    const card = cards[i === 0 ? 1 : i === 1 ? 0 : 2];
    if (!card) return;
    card.querySelector(".name").innerText = `ID ${u.id}`;
    card.querySelector(".score").innerText = `${u.balance} NXN`;
  });
}
