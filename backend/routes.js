import { db } from "./db.js";
import { tap } from "./gameLogic.js";

function regenEnergy(user) {
  const now = Math.floor(Date.now() / 1000);
  const last = user.last_energy_update || now;
  const diff = now - last;
  const regen = Math.floor(diff / 3);

  if (regen > 0) {
    user.energy = Math.min(user.max_energy, user.energy + regen);
    user.last_energy_update = now;
  }
  return user;
}

export function routes(app) {

  app.post("/init", (req, res) => {
    const { id } = req.body;

    db.get("SELECT * FROM users WHERE id=?", [id], (_, user) => {
      if (!user) {
        db.run(
          "INSERT INTO users (id, last_energy_update) VALUES (?, ?)",
          [id, Math.floor(Date.now() / 1000)],
          () => {
            db.get("SELECT * FROM users WHERE id=?", [id], (_, u) => res.json(u));
          }
        );
      } else {
        user = regenEnergy(user);
        db.run(
          "UPDATE users SET energy=?, last_energy_update=? WHERE id=?",
          [user.energy, user.last_energy_update, id]
        );
        res.json(user);
      }
    });
  });

  app.post("/tap", (req, res) => {
    const { id } = req.body;

    db.get("SELECT * FROM users WHERE id=?", [id], (_, user) => {
      user = regenEnergy(user);
      const updated = tap(user);
      if (!updated) return res.status(400).json({ error: "no energy" });

      db.run(
        "UPDATE users SET balance=?, energy=?, last_energy_update=? WHERE id=?",
        [updated.balance, updated.energy, updated.last_energy_update, id],
        () => res.json(updated)
      );
    });
  });

  app.post("/upgrade", (req, res) => {
    const { id, type } = req.body;

    const upgrades = {
      tap1: { cost: 10000, field: "tap_power", value: 1 },
      energy100: { cost: 20000, field: "max_energy", value: 100 }
    };

    const up = upgrades[type];
    if (!up) return res.status(400).json({ error: "invalid upgrade" });

    db.get("SELECT * FROM users WHERE id=?", [id], (_, user) => {
      if (user.balance < up.cost)
        return res.status(400).json({ error: "no balance" });

      db.run(
        `UPDATE users 
         SET balance=balance-?, ${up.field}=${up.field}+?
         WHERE id=?`,
        [up.cost, up.value, id],
        () => res.json({ ok: true })
      );
    });
  });

  app.post("/transfer", (req, res) => {
    const { from, to, amount } = req.body;
    const fee = Math.floor(amount * 0.1);
    const total = amount + fee;

    db.get("SELECT * FROM users WHERE id=?", [from], (_, sender) => {
      if (!sender || sender.balance < total)
        return res.status(400).json({ error: "not enough balance" });

      db.run("UPDATE users SET balance=balance-? WHERE id=?", [total, from]);
      db.run("UPDATE users SET balance=balance+? WHERE id=?", [amount, to]);
      db.run(
        "INSERT INTO transfers (from_id,to_id,amount,fee) VALUES (?,?,?,?)",
        [from, to, amount, fee]
      );

      res.json({ ok: true });
    });
  });
}
