import dotenv from 'dotenv';
dotenv.config();

const channels = process.env.FORCE_SUB_CHANNELS ? process.env.FORCE_SUB_CHANNELS.split(',').map(c => c.trim()) : [];

export async function forceSubscribe(ctx, next) {
    if (!channels.length) return next(); // Skip if no channels are set

    let notJoinedChannels = [];

    for (let channel of channels) {
        try {
            console.log(`🔍 Checking subscription for user: ${ctx.from.id} in ${channel}`);

            // Get user's membership status in the channel
            const user = await ctx.telegram.getChatMember(channel, ctx.from.id);

            // If the user is an admin, skip Force Subscribe check
            if (["administrator", "creator"].includes(user.status)) {
                console.log(`✅ User ${ctx.from.id} is an admin in ${channel}. Skipping Force Subscribe.`);
                return next(); // Allow admin to continue
            }

            // If not a member, add to the list of required channels
            if (!["member", "administrator", "creator"].includes(user.status)) {
                notJoinedChannels.push(`👉 [Join Here](https://t.me/${channel.replace('@', '')})`);
            }
        } catch (error) {
            console.error(`⚠️ Error checking ${channel}:`, error);
            notJoinedChannels.push(`👉 [Join Here](https://t.me/${channel.replace('@', '')})`);
        }
    }

    // If user is not in all required channels, send the warning message
    if (notJoinedChannels.length > 0) {
        return ctx.reply(
            `❌ Please join all required channels before using this bot:\n\n${notJoinedChannels.join("\n")}\n\nAfter joining, send /start again.`,
            { parse_mode: "Markdown", disable_web_page_preview: true }
        );
    }

    return next();
}
