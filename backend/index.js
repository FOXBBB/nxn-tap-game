import express from "express";
import cors from "cors";
import routes from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API
app.use(routes);

// Frontend
app.use(express.static("webapp"));

const PORT = process.env.PORT || 3000;
import { loadDB, saveDB } from "./db.js";


// ===== ENERGY REGEN (SERVER SIDE) =====
setInterval(() => {
  const db = loadDB();
  let changed = false;

  db.users.forEach(user => {
    if (user.energy < user.maxEnergy) {
      user.energy += 1;
      if (user.energy > user.maxEnergy) {
        user.energy = user.maxEnergy;
      }
      changed = true;
    }
  });

  if (changed) {
    saveDB(db);
  }
}, 3000); // каждые 3 секунды


app.listen(PORT, () => {
  console.log("NXN backend running on", PORT);
});
