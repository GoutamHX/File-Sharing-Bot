import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Telegram Bot is Running!");
});
export default app;
