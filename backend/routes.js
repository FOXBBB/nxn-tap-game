// backend/routes.js
import * as db from "./db.js";

export function routes(app) {

  app.get("/leaderboard", (req, res) => {
    try {
      const users =
        db.users ||
        db.default?.users ||
        {};

      const list = Object.values(users);

      const top = list
        .sort((a, b) => (b.balance || 0) - (a.balance || 0))
        .slice(0, 10)
        .map(u => ({
          id: u.id,
          name: u.username || u.first_name || "Player",
          avatar: u.photo_url || "",
          balance: u.balance || 0
        }));

      res.json(top);
    } catch (err) {
      console.error("Leaderboard error:", err);
      res.status(500).json([]);
    }
  });
  // ===== SYNC USER =====
app.post("/sync", (req, res) => {
  try {
    const { id, username, first_name, photo_url, balance } = req.body;

    if (!id) {
      return res.status(400).json({ ok: false });
    }

    if (!db.users) db.users = {};

    db.users[id] = {
      id,
      username,
      first_name,
      photo_url,
      balance: balance || 0
    };

    res.json({ ok: true });
  } catch (e) {
    console.error("Sync error", e);
    res.status(500).json({ ok: false });
  }
});


}
