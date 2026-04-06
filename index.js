const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const pino = require("pino");
const config = require("./config");

// Load commands system
const { commands } = require("./command");

// 🔥 LOAD ALL PLUGINS (THIS WAS YOUR MAIN PROBLEM)
fs.readdirSync("./plugins").forEach(file => {
    require(`./plugins/${file}`);
});

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Frontier-MD", "Chrome", "1.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    console.log("✅ Bot Connected...");

    // 🔥 MAIN MESSAGE HANDLER
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const mek = messages[0];
            if (!mek.message) return;

            const m = mek.message;

            const text =
                m.conversation ||
                m.extendedTextMessage?.text ||
                m.imageMessage?.caption ||
                m.videoMessage?.caption ||
                "";

            const from = mek.key.remoteJid;

            console.log("📩", text);

            const prefix = config.PREFIX || ".";

            if (!text.startsWith(prefix)) return;

            const args = text.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            const cmd = commands.find(
                c => c.pattern === command || c.alias?.includes(command)
            );

            if (!cmd) return;

            await cmd.function(sock, mek, {
                from,
                args,
                text,
                reply: (msg) =>
                    sock.sendMessage(from, { text: msg }, { quoted: mek })
            });

        } catch (err) {
            console.log("❌ Error:", err);
        }
    });

    // reconnect if disconnected
    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            }
        }
    });
}

startBot();
