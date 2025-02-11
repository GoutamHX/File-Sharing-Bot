import express from 'express';
import bot from './bot/bot.js';
import dotenv from 'dotenv';
import { Analytics } from "@vercel/analytics/react"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// ✅ Set up Telegram Webhook
const WEBHOOK_URL = `https://${process.env.VERCEL_URL}/api/webhook`;

bot.telegram.setWebhook(WEBHOOK_URL)
    .then(() => console.log(`✅ Webhook set to: ${WEBHOOK_URL}`))
    .catch(err => console.error("❌ Error setting webhook:", err));

app.post('/api/webhook', (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// ✅ Start Express server (required for Vercel)
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
