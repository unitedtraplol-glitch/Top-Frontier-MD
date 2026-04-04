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

// ✅ KEEP RENDER ALIVE (FIX PORT ERROR)
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Frontier-MD Bot is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

// ================= SETTINGS =================
let chatbotEnabled = false;
const OWNER_NUMBER = "263786166039";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ================= START BOT =================
async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("./sessions"); // ✅ FIXED
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

        if (msg.key.fromMe) return;

        // group must reply to bot
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
You are stylish, friendly, a bit playful, and very helpful.
You guide users on how to use bot commands.

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
