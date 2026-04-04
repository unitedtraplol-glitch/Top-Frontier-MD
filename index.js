require("dotenv").config();

const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const axios = require("axios");
const express = require("express");

const app = express();

// ================= KEEP RENDER ALIVE =================
app.get("/", (req, res) => {
  res.send("Frontier-MD Bot is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌐 Server running on port " + PORT));

// ================= SETTINGS =================
let chatbotEnabled = false;
const OWNER_NUMBER = "263786166039";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SESSION_ID = process.env.SESSION_ID;

if (!SESSION_ID) {
  console.log("❌ SESSION_ID not found!");
  process.exit(1);
}

// ================= START BOT =================
async function startBot() {

  const { version } = await fetchLatestBaileysVersion();

  // ================= SESSION (OLD STYLE FIX) =================
  let session = SESSION_ID;

  // remove prefix like ARSLAN-MD~
  if (session.includes("~")) {
    session = session.split("~")[1];
  }

  let authInfo;

  try {
    const decoded = JSON.parse(
      Buffer.from(session, "base64").toString("utf-8")
    );

    // force structure like old bots
    authInfo = {
      creds: decoded,
      keys: {}
    };

  } catch (e) {
    console.log("❌ Invalid SESSION_ID");
    process.exit(1);
  }

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: authInfo,
    version
  });

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
        msg.message.extendedTextMessage?.text ||
        "";

      if (!body) return;

      const prefix = ".";
      const isCmd = body.startsWith(prefix);

      const command = isCmd
        ? body.slice(1).split(" ")[0].toLowerCase()
        : "";

      const args = body.trim().split(/ +/).slice(1);

      const isCreator = sender.includes(OWNER_NUMBER);

      const reply = (text) =>
        sock.sendMessage(from, { text }, { quoted: msg });

      // ================= COMMANDS =================
      if (isCmd) {
        switch (command) {

          case "chatbot":
            if (!isCreator) return reply("❌ Owner only");

            if (args[0] === "on") {
              chatbotEnabled = true;
              return reply("🤖 Chatbot Enabled");
            }

            if (args[0] === "off") {
              chatbotEnabled = false;
              return reply("❌ Chatbot Disabled");
            }

            return reply("Usage: .chatbot on/off");
        }
      }

      // ================= AUTO CHATBOT =================
      if (chatbotEnabled && !isCmd) {

        if (msg.key.fromMe) return;

        if (isGroup) {
          const context = msg.message?.extendedTextMessage?.contextInfo;
          if (!context?.participant) return;
        }

        const senderNumber = sender.split("@")[0];
        if (senderNumber === OWNER_NUMBER) return;

        const prompt = `
You are Frontier-MD, a smart female anime AI assistant 🤖✨
Your master is Sir ꧁𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣꧂.
You are stylish, friendly, playful, and helpful.
Guide users on bot commands when needed.

User: ${body}
`;

        try {
          const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
              contents: [{ parts: [{ text: prompt }] }]
            }
          );

          const replyText =
            res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "🤖 I didn't understand that.";

          await sock.sendMessage(from, { text: replyText }, { quoted: msg });

        } catch (e) {
          console.log("❌ Gemini Error:", e.response?.data || e.message);
        }
      }

    } catch (err) {
      console.log("❌ Message Error:", err);
    }
  });

  // ================= CONNECTION =================
  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log("⚠️ Connection closed");

      if (shouldReconnect) {
        console.log("🔄 Reconnecting...");
        startBot();
      } else {
        console.log("❌ Session expired or invalid");
      }

    } else if (connection === "open") {
      console.log("✅ Bot connected successfully");
    }

  });

}

// ================= START =================
startBot();
