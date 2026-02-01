const userId = Math.floor(Math.random() * 1e9);

let currentUser = null;

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById("screen-" + name).classList.remove("hidden");

  document.querySelectorAll(".bottom-menu div").forEach(i => i.classList.remove("active"));
  if (name === "leaderboard") document.querySelector(".bottom-menu div:nth-child(1)").classList.add("active");
  if (name === "tap") document.querySelector(".bottom-menu div:nth-child(2)").classList.add("active");
  if (name === "shop") document.querySelector(".bottom-menu div:nth-child(3)").classList.add("active");
}

function updateUI(user) {
  if (!user) return;

  currentUser = user;

  const balance = user.balance ?? 0;
  const energy = user.energy ?? 0;
  const maxEnergy = user.max_energy ?? 0;
  const tapPower = user.tap_power ?? 1;

  document.getElementById("stats").innerText =
    `Balance: ${balance} | Energy: ${energy}/${maxEnergy} | Tap +${tapPower}`;
}

function loadLeaderboard() {
  fetch("/leaderboard")
    .then(r => r.json())
    .then(data => {
      document.getElementById("leaderboard").innerHTML =
        data.map((u, i) =>
          `<div>#${i + 1} — ID ${u.id} — ${u.balance}</div>`
        ).join("");
    });
}

// INIT
fetch("/init", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: userId })
})
.then(r => r.json())
.then(user => {
  updateUI(user);
  loadLeaderboard();
});

// TAP
function tap(e) {
  if (!currentUser || currentUser.energy <= 0) {
    return;
  }

  fetch("/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId })
  })
  .then(r => r.json())
  .then(user => {
    updateUI(user);
    loadLeaderboard();
  });
}

// AUTO ENERGY UPDATE (каждые 3 сек)
setInterval(() => {
  fetch("/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId })
  })
  .then(r => r.json())
  .then(updateUI);
}, 3000);

function buy(type) {
  fetch("/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, type })
  })
  .then(r => r.json())
  .then(updateUI);
}

function transfer() {
  fetch("/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: userId,
      to: document.getElementById("toId").value,
      amount: Number(document.getElementById("amount").value)
    })
  });
}
