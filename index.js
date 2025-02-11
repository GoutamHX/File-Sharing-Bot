import express from "express";
import bot from "./bot/bot.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json()); // ✅ Make sure it can parse JSON requests

const PORT = process.env.PORT || 8080;

// Check if running in production (Vercel) or locally
const isUsingPolling = process.env.USE_POLLING === "true";
const isProduction = process.env.VERCEL_URL !== undefined;

if (isUsingPolling) {
    console.log("🟢 Running in Local Mode (Using Long Polling)...");
    bot.launch()
        .then(() => console.log("🤖 Bot started in Long Polling mode (Local)"))
        .catch(err => console.error("❌ Error starting bot:", err));
} else if (isProduction) {
    const WEBHOOK_URL = `${process.env.VERCEL_URL}/api/webhook`;
    bot.telegram.setWebhook(WEBHOOK_URL)
        .then(() => console.log(`✅ Webhook set to: ${WEBHOOK_URL}`))
        .catch(err => console.error("❌ Error setting webhook:", err));

    app.post('/api/webhook', (req, res) => {
        console.log("✅ Received Telegram Webhook Update");
        bot.handleUpdate(req.body).catch(err => console.error("❌ Error handling update:", err));
        res.sendStatus(200); // ✅ Send 200 OK response
    });
}

// ✅ Route to check if server is running
app.get("/", (req, res) => {
    res.send("✅ Telegram Bot is Running!");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
