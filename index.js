
require("dotenv").config();

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const axios = require("axios");

let chatbotEnabled = false;
const OWNER_NUMBER = "263786166039";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ================= START BOT =================
async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState("./session");
const { version } = await fetchLatestBaileysVersion();

const sock = makeWASocket({
logger: pino({ level: "silent" }),
auth: state,
version
});

// SAVE SESSION
sock.ev.on("creds.update", saveCreds);

// ================= MESSAGE HANDLER =================
sock.ev.on("messages.upsert", async ({ messages }) => {
try {
const msg = messages[0];
if (!msg.message) return;

const from = msg.key.remoteJid;
const isGroup = from.endsWith("@g.us");
const sender = isGroup
? msg.key.participant
: msg.key.remoteJid;

const body =
msg.message.conversation ||
msg.message.extendedTextMessage?.text || "";

const prefix = ".";
const isCmd = body.startsWith(prefix);
const command = isCmd ? body.slice(1).split(" ")[0].toLowerCase() : "";
const args = body.trim().split(/ +/).slice(1);

const isCreator = sender.includes(OWNER_NUMBER);

const reply = (text) => {
sock.sendMessage(from, { text }, { quoted: msg });
};

// ================= COMMANDS =================
switch (command) {

case "chatbot":
if (!isCreator) return reply("❌ Owner only");

if (args[0] === "on") {
chatbotEnabled = true;
reply("🤖 Chatbot Enabled");
} else if (args[0] === "off") {
chatbotEnabled = false;
reply("❌ Chatbot Disabled");
} else {
reply("Usage: .chatbot on/off");
}
break;

}

// ================= AUTO CHATBOT =================
if (chatbotEnabled && !isCmd) {

const senderNumber = sender.split("@")[0];

// ignore bot itself
if (msg.key.fromMe) return;

// group → must reply to bot
if (isGroup && !msg.message?.extendedTextMessage?.contextInfo?.participant) return;

// ignore owner
if (senderNumber === OWNER_NUMBER) return;

const userText = body;
if (!userText) return;

const prompt = `
You are Frontier-MD, a smart female anime AI assistant 🤖✨
Your master is Sir ꧁𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣꧂.
You are stylish, friendly and helpful.
You also help users understand bot commands.

User: ${userText}
`;

try {

const res = await axios.post(
"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
{
contents: [{ parts: [{ text: prompt }] }]
}
);

const replyText =
res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "🤖...";

await sock.sendMessage(from, { text: replyText }, { quoted: msg });

} catch (e) {
console.log("Gemini Error:", e.message);
}

}

} catch (err) {
console.log("Error:", err);
}
});

// ================= CONNECTION =================
sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {

if (connection === "close") {
const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

if (shouldReconnect) {
startBot();
}
} else if (connection === "open") {
console.log("✅ Bot connected to WhatsApp");
}

});

}

startBot();
