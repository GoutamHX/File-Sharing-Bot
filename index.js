import express from "express";
import bot from "./bot/bot.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json()); // ✅ Parse JSON requests

const PORT = process.env.PORT || 8080;
const isUsingPolling = process.env.USE_POLLING === "true";
const isProduction = !!process.env.VERCEL_URL; // ✅ Ensure Vercel URL exists

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
        bot.handleUpdate(req.body)
            .then(() => res.sendStatus(200))
            .catch(err => {
                console.error("❌ Error handling update:", err);
                res.sendStatus(500);
            });
    });
}

// ✅ Route to Keep Vercel Awake
app.get("/", (req, res) => {
    res.send("✅ Telegram Bot is Running!");
});

// ✅ Keep Vercel Bot Active (Prevents Sleep)
setInterval(() => {
    fetch(`${process.env.VERCEL_URL}`)
        .then(() => console.log("✅ Keeping bot active..."))
        .catch(err => console.error("❌ Error keeping bot active:", err));
}, 5 * 60 * 1000); // Ping Vercel every 5 minutes

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
