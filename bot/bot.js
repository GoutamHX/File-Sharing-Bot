import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import { forceSubscribe } from './middleware.js';
dotenv.config();

const bot = new Telegraf(process.env.TG_BOT_TOKEN);
const CHANNEL_ID = parseInt(process.env.CHANNEL_ID);
const BOT_USERNAME = process.env.BOT_USERNAME || "your_bot_username";
const DELETE_TIME = parseInt(process.env.AUTO_DELETE_TIME || "0") * 60 * 1000; // Convert minutes to milliseconds

// ✅ Store user file data in memory
let userFiles = {};

// Apply Force Subscribe Middleware
bot.use(forceSubscribe);

// ✅ Handle /start command for retrieving files
bot.start(async (ctx) => {
    const args = ctx.message.text.split(" ");

    if (args.length > 1 && args[1].startsWith("get-")) {
        const messageId = args[1].replace("get-", "");

        async function fetchFile(retryCount = 3) {
            try {
                // ✅ Try retrieving the file
                const retrievedMessage = await ctx.telegram.copyMessage(ctx.chat.id, CHANNEL_ID, messageId);

                // Generate the warning message
                const alertMessage = await ctx.reply(
                    `⚠️ *This file will be auto-deleted in ${DELETE_TIME / 60000} minutes!*\n📂 Please save it before it's removed due to copyright issues.`,
                    Markup.inlineKeyboard([
                        Markup.button.callback("🗑 Delete Now", `delete_${ctx.chat.id}_${retrievedMessage.message_id}`)
                    ])
                );

                // ✅ Auto-delete after AUTO_DELETE_TIME
                if (DELETE_TIME > 0) {
                    setTimeout(async () => {
                        try {
                            await ctx.telegram.deleteMessage(ctx.chat.id, retrievedMessage.message_id).catch(() => {});
                            await ctx.telegram.deleteMessage(ctx.chat.id, alertMessage.message_id).catch(() => {});
                        } catch (error) {
                            console.log("❌ Error deleting retrieved file or alert message:", error);
                        }
                    }, DELETE_TIME);
                }
            } catch (error) {
                console.error("❌ Error retrieving the file:", error);

                if (error.code === 'ECONNRESET' && retryCount > 0) {
                    console.log(`🔄 Retrying... (${4 - retryCount}/3)`);
                    setTimeout(() => fetchFile(retryCount - 1), 3000); // Wait 3 sec & retry
                } else {
                    ctx.reply("❌ Failed to retrieve the file. Please try again later.");
                }
            }
        }

        // ✅ Call the function to fetch the file
        fetchFile();
    } else {
        ctx.reply(`Hello ${ctx.from.first_name}! Send me any file (documents, videos, images), and I'll generate a shareable link.`);
    }
});


// ✅ Handle all media types, generate shareable links, and auto-delete messages
bot.on(['document', 'video', 'photo', 'audio', 'animation'], async (ctx) => {
    try {
        // Forward media to channel
        const forwardedMessage = await ctx.telegram.forwardMessage(
            CHANNEL_ID,
            ctx.chat.id,
            ctx.message.message_id
        );

        // Generate file link
        const fileLink = `https://t.me/${BOT_USERNAME}?start=get-${forwardedMessage.message_id}`;

        // ✅ Store file in userFiles (Fixing `/myfiles` issue)
        if (!userFiles[ctx.from.id]) {
            userFiles[ctx.from.id] = [];
        }
        userFiles[ctx.from.id].push({
            file_id: ctx.message.message_id,
            message_id: forwardedMessage.message_id,
            fileLink: fileLink
        });

        // Send link as text (for sharing) + Button (for quick access)
        const linkMessage = await ctx.reply(
            `✅ *Your file is ready!*\n\n🔗 *Shareable Link:*\n${fileLink}`,
            {
                parse_mode: "Markdown",
                reply_markup: Markup.inlineKeyboard([
                    Markup.button.url("📂 Open File", fileLink)
                ])
            }
        );

        // Auto-delete file link after AUTO_DELETE_TIME
        if (DELETE_TIME > 0) {
            setTimeout(async () => {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, linkMessage.message_id).catch(() => {});
                } catch (error) {
                    console.log("❌ Error deleting link message:", error);
                }
            }, DELETE_TIME);
        }
    } catch (error) {
        console.error("❌ Failed to store the file:", error);
        ctx.reply("❌ Failed to store the file. Please try again.");
    }
});

// ✅ Handle /myfiles command (Now Automatically Removes Deleted Files!)
bot.command("myfiles", async (ctx) => {
    try {
        const userId = ctx.from.id;

        if (!userFiles[userId] || userFiles[userId].length === 0) {
            return ctx.reply("📂 You have no saved files in the channel.");
        }

        let message = "📁 *Your Stored Files:*\n\n";
        let validFiles = [];

        for (const file of userFiles[userId]) {
            try {
                // ✅ Check if the file still exists in the channel
                await ctx.telegram.getChat(CHANNEL_ID);
                message += `🔹 [File](${file.fileLink}) 📂\n`;
                validFiles.push(file);
            } catch (error) {
                console.log(`❌ File deleted: ${file.fileLink}`);
            }
        }

        // ✅ Update userFiles to remove deleted files
        userFiles[userId] = validFiles;

        if (validFiles.length === 0) {
            return ctx.reply("⚠️ All your saved files have been deleted from the channel.");
        }

        ctx.reply(message, { parse_mode: "Markdown", disable_web_page_preview: true });
    } catch (error) {
        console.error("❌ Error fetching channel files:", error);
        ctx.reply("⚠️ Failed to retrieve your files. Please try again later.");
    }
});

// ✅ Handle "Delete Now" button
bot.action(/delete_(\d+)_(\d+)/, async (ctx) => {
    const parts = ctx.match[0].split('_');
    const chatId = parts[1];
    const messageId = parts[2];

    try {
        await ctx.telegram.deleteMessage(chatId, messageId);
        await ctx.reply("🗑 File deleted successfully.");
    } catch (error) {
        console.log("❌ Error deleting file:", error);
        ctx.reply("⚠️ Failed to delete the file.");
    }
});

export default bot;
