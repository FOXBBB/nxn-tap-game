const userId = Math.floor(Math.random() * 1e9);

fetch("/init", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: userId })
})
  .then(r => r.json())
  .then(update);

function tap() {
  fetch("/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId })
  })
    .then(r => r.json())
    .then(update);
}

function buy(type) {
  fetch("/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, type })
  }).then(r => r.json()).then(console.log);
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
  }).then(r => r.json()).then(console.log);
}

function update(user) {
  document.getElementById("stats").innerText =
    `Balance: ${user.balance} | Energy: ${user.energy}/${user.max_energy} | Tap: ${user.tap_power}`;
}
