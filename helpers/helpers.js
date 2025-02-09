import base64url from 'base64-url';
import dotenv from 'dotenv';
dotenv.config();

export function encode(data) {
    return base64url.encode(data);
}

export function decode(data) {
    return base64url.decode(data);
}

export function generateLink(fileId) {
    const botUsername = process.env.BOT_USERNAME || "your_bot_username";
    return `https://t.me/${botUsername}?start=${encode(`get-${fileId}`)}`;
}
