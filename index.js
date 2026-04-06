const fs = require("fs");
const path = require("path");
const pino = require("pino");
const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

require("dotenv").config();

const app = express();

// ✅ Render port fix (IMPORTANT)
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Frontier-MD Bot is Running ✅");
});

app.listen(PORT, () => {
  console.log(`🌍 Server running on port ${PORT}`);
});

// =============================
// 🔐 SESSION LOGIN (NO QR)
// =============================
async function connectBot() {
  const sessionId = process.env.SESSION_ID;

  if (!sessionId) {
    console.log("❌ SESSION_ID missing in env");
    return;
  }

  console.log("✅ SESSION_ID Loaded");

  const sessionPath = "./session";

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  // Decode session and save creds
  const credsPath = path.join(sessionPath, "creds.json");

  if (!fs.existsSync(credsPath)) {
    const decoded = Buffer.from(sessionId, "base64").toString("utf-8");
    fs.writeFileSync(credsPath, decoded);
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Frontier-MD", "Chrome", "1.0.0"]
  });

  // =============================
  // ✅ CONNECTION HANDLER
  // =============================
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ Bot Connected to WhatsApp!");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Session expired. Add new SESSION_ID");
      } else {
        console.log("🔄 Reconnecting...");
        connectBot();
      }
    }
  });

  // =============================
  // 💾 SAVE CREDS
  // =============================
  sock.ev.on("creds.update", saveCreds);

  // =============================
  // 🤖 MESSAGE HANDLER (FIXED)
  // =============================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    const msg =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      "";

    const from = m.key.remoteJid;

    console.log("📩 Message:", msg);

    // =============================
    // COMMANDS
    // =============================
    if (msg.toLowerCase() === ".ping") {
      await sock.sendMessage(from, { text: "🏓 Pong!" }, { quoted: m });
    }

    if (msg.toLowerCase() === ".alive") {
      await sock.sendMessage(from, {
        text: "✅ Frontier-MD is Alive 🚀"
      }, { quoted: m });
    }
  });
}

// Start bot
connectBot();
