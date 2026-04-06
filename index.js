const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");

const { commands } = require("./command");

// ===== LOAD COMMAND FILES =====
function loadCommands() {
  const pluginPath = path.join(__dirname, "./plugins");

  fs.readdirSync(pluginPath).forEach(file => {
    if (file.endsWith(".js")) {
      require(`./plugins/${file}`);
      console.log("✅ Loaded:", file);
    }
  });
}

// ===== START BOT =====
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: true,
    browser: ["Frontier-MD", "Chrome", "1.0.0"]
  });

  // ===== CONNECTION =====
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔁 Reconnecting...");
        startBot();
      } else {
        console.log("❌ Logged out.");
      }
    }

    if (connection === "open") {
      console.log("✅ Bot Connected!");
      loadCommands();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ===== MESSAGE HANDLER =====
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;
    if (m.key.fromMe) return;

    const from = m.key.remoteJid;

    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      "";

    const prefix = ".";

    if (!body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    console.log("📩 Command:", command);

    for (let cmd of commands) {
      if (!cmd.pattern) continue;

      const pattern = cmd.pattern.toString().replace(/[^a-zA-Z]/g, "");

      if (pattern === command || cmd.alias?.includes(command)) {
        try {
          await cmd.function(
            sock,
            m,
            {
              from,
              body,
              args,
              reply: (msg) =>
                sock.sendMessage(from, { text: msg }, { quoted: m })
            }
          );
        } catch (e) {
          console.log("❌ Error:", e.message);
        }
      }
    }
  });
}

// ===== START =====
startBot();
