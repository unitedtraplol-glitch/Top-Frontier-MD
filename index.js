require("dotenv").config();

const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const axios = require("axios");
const express = require("express");
const os = require("os");

// ================= KEEP RENDER ALIVE =================
const app = express();
app.get("/", (req, res) => res.send("Frontier-MD Bot is running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌐 Server running on port " + PORT));

// ================= SETTINGS =================
let chatbotEnabled = false;
const OWNER_NUMBER = "263786166039";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SESSION_ID = process.env.SESSION_ID;

const startTime = Date.now();

// ================= FORMAT UPTIME =================
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${d}d ${h}h ${m}m ${s}s`;
}

// ================= START BOT =================
async function startBot() {

  if (!SESSION_ID) {
    console.log("❌ SESSION_ID not found in env");
    process.exit(1);
  }

  let creds;
  try {
    const session = SESSION_ID.replace("ARSLAN-MD~", "");
    creds = JSON.parse(Buffer.from(session, "base64").toString());
  } catch (e) {
    console.log("❌ Invalid SESSION_ID");
    process.exit(1);
  }

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: { creds, keys: {} },
    version
  });

  // ================= MESSAGE HANDLER =================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message) return;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");
      const sender = isGroup ? msg.key.participant : from;

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

        case "runtime":
        case "uptime":
        case "status":
          {
            const start = Date.now();

            const uptime = formatUptime(Date.now() - startTime);
            const ping = Date.now() - start;

            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
            const usedMem = totalMem - freeMem;

            const cpuModel = os.cpus()[0].model;

            const runtimeMsg = `
╭━━━〔 *🌌 FRONTIER-MD SYSTEM* 〕━━━⬣
┃ ⚙️ *Status:* ONLINE
┃ ⏳ *Uptime:* ${uptime}
┃ ⚡ *Speed:* ${ping} ms
┃ 🧠 *RAM:* ${usedMem}MB / ${totalMem}MB
┃ 💻 *CPU:* ${cpuModel}
┃ 🚀 *Core:* Frontier-MD AI
┃ 🧬 *Version:* v1.0 (Silent Core)
╰━━━━━━━━━━━━━━━━━━⬣
> ✦ Powered by ꧁𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣꧂ ✦
`;

            reply(runtimeMsg);
          }
          break;

      }

      // ================= AUTO CHATBOT =================
      if (chatbotEnabled && !isCmd) {

        if (msg.key.fromMe) return;

        if (isGroup) {
          const context = msg.message?.extendedTextMessage?.contextInfo;
          if (!context || !context.participant) return;
        }

        const senderNumber = sender.split("@")[0];
        if (senderNumber === OWNER_NUMBER) return;

        const userText = body;
        if (!userText) return;

        const prompt = `
You are Frontier-MD, a smart female anime AI assistant 🤖✨
Your master is Sir ꧁𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣꧂.
You are stylish, friendly, playful, and helpful.

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
        console.log("🔄 Reconnecting...");
        startBot();
      }
    } else if (connection === "open") {
      console.log("✅ Bot connected to WhatsApp");
    }

  });

}

startBot();
