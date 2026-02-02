import { loadDB, saveDB } from "./db.js";

export default function routes(app) {

  // ===== LEADERBOARD =====
  app.get("/leaderboard", async (req, res) => {
    try {
      const db = await loadDB();
      if (!db.users) db.users = {};

      const users = Object.values(db.users);

      const top = users
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
