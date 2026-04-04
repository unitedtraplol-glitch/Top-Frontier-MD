const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getContentType,
  jidNormalizedUser
} = require("@whiskeysockets/baileys");

const P = require("pino");
const fs = require("fs");
const path = require("path");
const express = require("express");

const config = require("./config");

// ===== EXPRESS SERVER (FOR RENDER) =====
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ Frontier MD Bot Running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ===== MAIN FUNCTION =====
async function connectToWA() {
  console.log("Connecting to WhatsApp ⏳️...");

  const { state, saveCreds } = await useMultiFileAuthState("./sessions");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    version,
    browser: ["Frontier", "Chrome", "1.0.0"]
  });

  // ===== CONNECTION HANDLER =====
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconnecting...");
        connectToWA();
      } else {
        console.log("❌ Logged out. Scan QR again.");
      }
    }

    if (connection === "open") {
      console.log("✅ Bot connected to WhatsApp");

      // ===== LOAD PLUGINS =====
      console.log("🧬 Installing Plugins...");
      fs.readdirSync("./plugins").forEach(file => {
        if (file.endsWith(".js")) {
          require("./plugins/" + file);
        }
      });
      console.log("✅ Plugins installed successfully");

      // ===== SAFE DELAY BEFORE SENDING =====
      setTimeout(async () => {
        try {
          await sock.sendMessage(sock.user.id, {
            text: "🔥 *Frontier MD is now active!*"
          });
        } catch (err) {
          console.log("Send error:", err);
        }
      }, 5000);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ===== MESSAGE HANDLER =====
  sock.ev.on("messages.upsert", async (msg) => {
    try {
      const m = msg.messages[0];
      if (!m.message) return;

      const type = getContentType(m.message);
      const body =
        type === "conversation"
          ? m.message.conversation
          : type === "extendedTextMessage"
          ? m.message.extendedTextMessage.text
          : "";

      const from = m.key.remoteJid;
      const sender = m.key.participant || m.key.remoteJid;

      const prefix = config.PREFIX || ".";
      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";
      const args = body.trim().split(/ +/).slice(1);

      if (!isCmd) return;

      console.log(`📩 Command: ${command}`);

      // ===== SIMPLE TEST COMMAND =====
      if (command === "ping") {
        await sock.sendMessage(from, { text: "🏓 Pong!" }, { quoted: m });
      }

      // ===== LOAD COMMAND HANDLER =====
      const commands = require("./lib/command").commands;

      const cmd = commands.find(c => c.pattern === command);

      if (cmd) {
        await cmd.function(sock, m, {
          from,
          args,
          reply: async (text) => {
            try {
              await sock.sendMessage(from, { text }, { quoted: m });
            } catch (e) {
              console.log("Reply error:", e);
            }
          }
        });
      }

    } catch (err) {
      console.log("Message error:", err);
    }
  });
}

// ===== START BOT =====
connectToWA();
