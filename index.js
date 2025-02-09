import bot from './bot/bot.js';
import expressApp from './server.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8080;

// Start Express server
expressApp.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Start Telegram bot
bot.launch().then(() => {
    console.log('🤖 Telegram bot started!');
}).catch(err => console.error('❌ Error starting bot:', err));
// Set up webhooks
app.post('/' + bot.token, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  
// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
