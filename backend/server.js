import express from "express";
import router from "./routes.js";

const app = express();

// middleware для JSON
app.use(express.json());

// 🔥 ПОДКЛЮЧАЕМ РОУТЕР
app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("NXN backend running on port", PORT);
});
