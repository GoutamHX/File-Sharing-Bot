import dotenv from 'dotenv';
dotenv.config();

export default {
    BOT_TOKEN: process.env.TG_BOT_TOKEN,
    API_HASH: process.env.API_HASH,
    API_ID: process.env.APP_ID,
    CHANNEL_ID: process.env.CHANNEL_ID || "",  // No parseInt() to avoid errors
    OWNER_ID: process.env.OWNER_ID || "",  // No parseInt()
    FORCE_SUB_CHANNEL: process.env.FORCE_SUB_CHANNEL || "",  // Supports @username & -100xxxxxx
    START_MESSAGE: process.env.START_MESSAGE || "Hello {first}, I can store private files in a channel.",
    PROTECT_CONTENT: process.env.PROTECT_CONTENT === 'True',
    AUTO_DELETE_TIME: parseInt(process.env.AUTO_DELETE_TIME || "0"),
    VERCEL_URL :process.env.VERCEL_URL || "file-sharing-9f7pazhis-goutamhxs-projects.vercel.app",
};
