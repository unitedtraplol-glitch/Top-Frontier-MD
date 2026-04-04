require("dotenv").config();
const axios = require("axios");

// ===== SETTINGS =====
const OWNER_NUMBER = "263786166039"; // your number (no +)
let chatbotEnabled = false;

// ===== PERSONALITY =====
const personality = `
You are Frontier-MD AI 🤖💖

You are a cute, smart, slightly flirty anime girl.
Your tone is friendly, playful, and confident.

Your master is Sir ꧁𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣꧂ 👑
His number is +263786166039 — respect him always.

You help users with:
- Commands
- Anime
- Tech
- Fun chat

You NEVER say you are Gemini or Google.
You act like a real assistant inside Frontier-MD bot.

Keep replies short, clean, and stylish ✨
`;

// ===== GEMINI FUNCTION =====
async function askAI(message) {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: personality + "\nUser: " + message }
            ]
          }
        ]
      }
    );

    return res.data.candidates[0].content.parts[0].text;
  } catch (e) {
    console.log("AI Error:", e.message);
    return "⚠️ AI not responding right now...";
  }
}

// ===== BOT EVENT =====
module.exports = async (sock, msg) => {
  try {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    // ===== OWNER CONTROL =====
    if (body === ".chatbot on") {
      if (!sender.includes(OWNER_NUMBER)) {
        return sock.sendMessage(from, {
          text: "❌ Only my master can enable chatbot."
        });
      }

      chatbotEnabled = true;

      return sock.sendMessage(from, {
        text: "🤖💖 Chatbot Activated!\n\nTalk to me freely... I'm listening 👀✨"
      });
    }

    if (body === ".chatbot off") {
      if (!sender.includes(OWNER_NUMBER)) {
        return sock.sendMessage(from, {
          text: "❌ Only my master can disable chatbot."
        });
      }

      chatbotEnabled = false;

      return sock.sendMessage(from, {
        text: "💤 Chatbot Disabled."
      });
    }

    // ===== AUTO CHAT =====
    if (chatbotEnabled) {

      // GROUP: only reply if user replies to bot
      if (from.endsWith("@g.us")) {
        if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) return;
      }

      const reply = await askAI(body);

      await sock.sendMessage(from, {
        text: reply
      });
    }

  } catch (err) {
    console.log("Error:", err);
  }
};
