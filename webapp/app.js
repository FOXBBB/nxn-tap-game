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

function update(user) {
  document.getElementById("balance").innerText =
    "Balance: " + user.balance + " | Energy: " + user.energy;
}
