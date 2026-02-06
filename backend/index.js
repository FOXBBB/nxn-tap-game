import express from "express";
import cors from "cors";
import routes from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { checkRewardCycle, runAutoclickers } from "./routes.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 API ТОЛЬКО С ПРЕФИКСОМ
app.use("/api", routes);

// 🔥 Frontend
app.use(
  express.static(
    path.join(__dirname, "../webapp")
  )
);

// 🔥 SPA fallback (очень важно)
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../webapp/index.html")
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("NXN backend running on", PORT);
});

// reward cycle
setInterval(() => {
  checkRewardCycle().catch(err =>
    console.error("Reward cycle error:", err)
  );
}, 60 * 60 * 1000); // 1 час

// autoclicker
setInterval(() => {
  runAutoclickers().catch(console.error);
}, 1000); // ⬅️ КАЖДУЮ СЕКУНДУ



