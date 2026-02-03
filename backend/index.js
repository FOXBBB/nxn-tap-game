import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// API
app.use("/", routes);

// Frontend
app.use(express.static("webapp"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("NXN backend running on", PORT);
});
