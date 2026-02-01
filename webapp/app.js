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

  // ===== TOP 3 =====
  const cards = document.querySelectorAll(".top-card");

  // порядок: [2-е, 1-е, 3-е] — как в дизайне
  const map = [1, 0, 2];

  map.forEach((cardIndex, i) => {
    const user = data[i];
    const card = cards[cardIndex];
    if (!user || !card) return;

    card.querySelector(".name").innerText = `ID ${user.id}`;
    card.querySelector(".score").innerText = `${user.balance} NXN`;
  });

  // ===== TOP 4–10 =====
  const list = document.getElementById("leaderboard");
  list.innerHTML = "";

  data.slice(3, 10).forEach((user, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>#${i + 4}</span>
      <span>ID ${user.id}</span>
      <span>${user.balance} NXN</span>
    `;
    list.appendChild(row);
  });
}
document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    const screen = item.dataset.screen;

    document.querySelectorAll(".screen").forEach(s =>
      s.classList.add("hidden")
    );
    document.getElementById(`screen-${screen}`).classList.remove("hidden");

    document.querySelectorAll(".menu-item").forEach(i =>
      i.classList.remove("active")
    );
    item.classList.add("active");

    if (screen === "leaderboard") loadLeaderboard();
  });
});

