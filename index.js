const fs = require("fs");
const path = require("path");
const express = require("express");
const pino = require("pino");
require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

// ==========================
// 🌍 EXPRESS SERVER
// ==========================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Frontier-MD running ✅");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on ${PORT}`);
});

// ==========================
// 📂 LOAD COMMAND SYSTEM
// ==========================
const { commands } = require("./command");

// Load all plugin files
fs.readdirSync("./plugins").forEach(file => {
  if (file.endsWith(".js")) {
    require(`./plugins/${file}`);
    console.log(`✅ Loaded plugin: ${file}`);
  }
});

// ==========================
// 🤖 BOT START
// ==========================
async function startBot() {
  const sessionId = process.env.SESSION_ID;

  if (!sessionId) {
    console.log("❌ SESSION_ID missing");
    return;
  }

  console.log("✅ SESSION_ID Loaded");

  const sessionDir = "./session";
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  const credsPath = path.join(sessionDir, "creds.json");

  if (!fs.existsSync(credsPath)) {
    const decoded = Buffer.from(sessionId, "base64").toString("utf-8");
    fs.writeFileSync(credsPath, decoded);
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Frontier-MD", "Chrome", "1.0.0"]
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("🟢 Connected to WhatsApp");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconnecting...");
        setTimeout(startBot, 5000);
      } else {
        console.log("❌ Session expired");
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ==========================
  // 📩 MESSAGE HANDLER (REAL FIX)
  // ==========================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const mek = messages[0];
    if (!mek.message) return;

    const m = mek;
    const from = mek.key.remoteJid;

    const msg =
      mek.message.conversation ||
      mek.message.extendedTextMessage?.text ||
      "";

    const args = msg.trim().split(/ +/).slice(1);
    const command = msg.trim().split(/ +/)[0].toLowerCase();

    for (let cmd of commands) {
      if (
        command === "." + cmd.pattern ||
        cmd.alias?.includes(command.replace(".", ""))
      ) {
        try {
          await cmd.function(sock, mek, m, {
            from,
            args,
            reply: (text) => sock.sendMessage(from, { text }, { quoted: mek })
          });
        } catch (e) {
          console.log("❌ Command Error:", e);
        }
      }
    }
  });
}

// START
startBot();
