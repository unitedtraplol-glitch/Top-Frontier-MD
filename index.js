const express = require("express");
const fs = require("fs");
const P = require("pino");
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");

// ================== KEEP RENDER ALIVE ==================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Frontier-MD Running ✅"));
app.listen(PORT, () => console.log("🌐 Server running on port " + PORT));

// ================== START BOT ==================
async function startBot() {

    const SESSION_ID = process.env.SESSION_ID;

    if (!SESSION_ID) {
        console.log("❌ SESSION_ID missing");
        return;
    }

    console.log("✅ SESSION_ID Loaded");

    // decode session
    if (!fs.existsSync("./sessions/creds.json")) {
        const decoded = Buffer.from(SESSION_ID, "base64").toString("utf-8");
        fs.writeFileSync("./sessions/creds.json", decoded);
    }

    const { state, saveCreds } = await useMultiFileAuthState("./sessions");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        auth: state,
        browser: ["Frontier-MD", "Chrome", "1.0"]
    });

    // ================== LOAD COMMAND SYSTEM ==================
    const { cmd, commands } = require("./command");

    fs.readdirSync("./plugins").forEach(file => {
        require(`./plugins/${file}`);
    });

    // ================== CONNECTION ==================
    sock.ev.on("connection.update", (update) => {
        const { connection } = update;

        if (connection === "open") {
            console.log("✅ BOT CONNECTED");
        }

        if (connection === "close") {
            console.log("🔁 Reconnecting...");
            startBot();
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ================== MESSAGE HANDLER (VERY IMPORTANT) ==================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const text =
            m.message.conversation ||
            m.message.extendedTextMessage?.text;

        if (!text) return;

        for (let command of commands) {
            if (text.startsWith(command.pattern)) {
                try {
                    await command.function(sock, m, {
                        text,
                        from: m.key.remoteJid
                    });
                } catch (err) {
                    console.log("❌ Command error:", err);
                }
            }
        }
    });

}

startBot();
