const userId = Math.floor(Math.random() * 1e9);

function update(user) {
  document.getElementById("stats").innerText =
    `Balance: ${user.balance} | Energy: ${user.energy}/${user.max_energy} | Tap: ${user.tap_power}`;
}

function loadLeaderboard() {
  fetch("/leaderboard")
    .then(r => r.json())
    .then(data => {
      document.getElementById("leaderboard").innerHTML =
        data.map((u, i) =>
          `<div>#${i+1} ID:${u.id} — ${u.balance}</div>`
        ).join("");
    });
}

fetch("/init", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: userId })
})
.then(r => r.json())
.then(u => {
  update(u);
  loadLeaderboard();
});

function tap() {
  fetch("/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId })
  })
  .then(r => r.json())
  .then(u => {
    update(u);
    loadLeaderboard();
  });
}

function buy(type) {
  fetch("/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, type })
  }).then(loadLeaderboard);
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
  }).then(loadLeaderboard);
}

