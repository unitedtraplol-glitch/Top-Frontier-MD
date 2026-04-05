const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "insulte",
    alias: ["insult"],
    desc: "Generate a random insult 😈",
    category: "fun",
    react: "😈",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const res = await axios.get("https://eliteprotech-apis.zone.id/insult");
        const data = res.data;

        // 🔍 Handle different API response formats
        const insult =
            data.result ||
            data.insult ||
            data.data ||
            "You're so slow, even a snail overtook you 🐌💀";

        const caption = `╭━━━〔 😈 INSULT GENERATOR 〕━━━⬣
┃ 💀 *Savage Mode Activated*
┃━━━━━━━━━━━━━━━━━━━⬣
┃ 🗣️ ${insult}
┃
┃ ⚡ Powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD
╰━━━━━━━━━━━━━━━━━━━⬣`;

        await conn.sendMessage(from, {
            text: caption
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Failed to generate insult");
    }
});
