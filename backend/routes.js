import * as db from "./db.js";

export default function routes(app) {

  app.get("/leaderboard", (req, res) => {
    try {
      // поддержка любой структуры db.js
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

}
