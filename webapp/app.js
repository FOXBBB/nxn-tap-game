let user = JSON.parse(localStorage.getItem("nxn_user")) || {
  balance: 0,
  energy: 100,
  maxEnergy: 100,
  tapPower: 1
};

const balanceEl = document.getElementById("balance");
const energyEl = document.getElementById("energy");
const coinEl = document.getElementById("coin");

/* SAVE */
function saveUser() {
  localStorage.setItem("nxn_user", JSON.stringify(user));
}

function updateUI() {
  balanceEl.innerText = `Balance: ${user.balance}`;
  energyEl.innerText = `Energy: ${user.energy} / ${user.maxEnergy}`;
  saveUser();
}

/* TAP */
coinEl.addEventListener("click", () => {
  if (user.energy <= 0) return;
  user.energy--;
  user.balance += user.tapPower;
  updateUI();
});

/* ENERGY REGEN */
setInterval(() => {
  if (user.energy < user.maxEnergy) {
    user.energy++;
    updateUI();
  }
}, 3000);

/* LEADERBOARD DEMO */
const leaderboard = document.getElementById("leaderboard-list");
if (leaderboard) {
  for (let i = 4; i <= 10; i++) {
    const row = document.createElement("div");
    row.className = "lb-row";
    row.innerHTML = `<span>#${i}</span><span>Player ${i}</span><span>${Math.floor(Math.random()*50000)} NXN</span>`;
    leaderboard.appendChild(row);
  }
}

/* MENU */
document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    const screen = item.dataset.screen;
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(`screen-${screen}`).classList.remove("hidden");

    document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

updateUI();
