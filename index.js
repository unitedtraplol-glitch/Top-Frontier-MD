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

// ===== LOAD PLUGINS =====
function loadPlugins() {
  const pluginDir = path.join(__dirname, "./plugins");

  if (!fs.existsSync(pluginDir)) return;

  fs.readdirSync(pluginDir).forEach(file => {
    if (file.endsWith(".js")) {
      require(`./plugins/${file}`);
      console.log("✅ Loaded:", file);
    }
  });
}

// ===== DECODE SESSION_ID =====
function loadSession() {
  if (!process.env.SESSION_ID) return;

  const sessionDir = "./session";

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir);
  }

  const decoded = Buffer.from(process.env.SESSION_ID, "base64").toString("utf-8");

  fs.writeFileSync(path.join(sessionDir, "creds.json"), decoded);
  console.log("✅ SESSION_ID Loaded");
}

// ===== START BOT =====
async function startBot() {
  loadSession();

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Star-XD", "Chrome", "1.0.0"]
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
        console.log("❌ Session expired. Add new SESSION_ID");
      }
    }

    if (connection === "open") {
      console.log("✅ Bot Connected!");
      loadPlugins();
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

startBot();
