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
app.use("/", routes);

// ⚠️ ВАЖНО: путь к webapp ОТНОСИТЕЛЬНО backend
app.use(
  express.static(
    path.join(__dirname, "../webapp")
  )
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("NXN backend running on", PORT);
});
