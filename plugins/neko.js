const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "neko",
    alias: ["catgirl"],
    desc: "Random neko image 🐱",
    category: "fun",
    react: "🐱",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const res = await axios.get("https://api.giftedtech.co.ke/api/anime/neko?apikey=gifted");
        const image = res.data.result;

        const caption = `╭━━━〔 🐱 NEKO IMAGE 〕━━━⬣

✨ Here's your random neko!

💖 Enjoy the vibes~

╰━━━〔 ⚡ Frontier MD 〕━━━⬣
powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-tech`;

        await conn.sendMessage(from, {
            image: { url: image },
            caption: caption
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Failed to fetch neko image.");
    }
});
