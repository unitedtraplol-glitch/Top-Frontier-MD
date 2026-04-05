const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "insulte",
    alias: ["insult"],
    desc: "Random insult 😈",
    category: "fun",
    react: "😈",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const res = await axios.get("https://eliteprotech-apis.zone.id/insult");
        const insult = res.data.result || res.data.insult || res.data;

        const caption = `╭━━━〔 😈 INSULT GENERATOR 〕━━━⬣

💀 ${insult}

🔥 Savage mode activated...

╰━━━〔 ⚡ Frontier MD 〕━━━⬣
powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-tech`;

        await conn.sendMessage(from, {
            text: caption
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Failed to generate insult.");
    }
});
