import { db } from "./db.js";
import { tap } from "./gameLogic.js";

export function routes(app) {

  app.post("/init", (req, res) => {
    const { id } = req.body;
    db.get("SELECT * FROM users WHERE id=?", [id], (err, row) => {
      if (!row) {
        db.run(
          "INSERT INTO users (id) VALUES (?)",
          [id],
          () => db.get("SELECT * FROM users WHERE id=?", [id], (_, u) => res.json(u))
        );
      } else {
        res.json(row);
      }
    });
  });

  app.post("/tap", (req, res) => {
    const { id } = req.body;
    db.get("SELECT * FROM users WHERE id=?", [id], (_, user) => {
      const updated = tap(user);
      if (!updated) return res.status(400).json({ error: "no energy" });
      db.run(
        "UPDATE users SET balance=?, energy=? WHERE id=?",
        [updated.balance, updated.energy, id],
        () => res.json(updated)
      );
    });
  });

  app.post("/transfer", (req, res) => {
    const { from, to, amount } = req.body;
    const fee = Math.floor(amount * 0.1);
    const total = amount + fee;

    db.get("SELECT * FROM users WHERE id=?", [from], (_, sender) => {
      if (!sender || sender.balance < total) {
        return res.status(400).json({ error: "not enough balance" });
      }

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
