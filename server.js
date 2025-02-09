import express from 'express';
const app = express();

app.get('/', (req, res) => {
    res.send("File-Sharing Bot is running...");
});

export default app;
