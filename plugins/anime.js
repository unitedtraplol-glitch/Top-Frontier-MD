const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "anime",
    alias: ["ani"],
    desc: "Get anime info 🎴",
    category: "fun",
    react: "🎴",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        let data;

        if (args.length > 0) {
            const query = args.join(" ");
            const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
            data = res.data.data[0];

            if (!data) return reply("❌ Anime not found.");

        } else {
            const res = await axios.get("https://api.jikan.moe/v4/random/anime");
            data = res.data.data;
        }

        const caption = `╭━━━〔 🎴 ANIME INFO 〕━━━⬣

📛 *Title:* ${data.title}
🎬 *Type:* ${data.type}
📺 *Episodes:* ${data.episodes || "N/A"}
📊 *Rating:* ${data.score || "N/A"}
📡 *Status:* ${data.status}

📖 *Story:* ${data.synopsis?.slice(0, 200) || "No description"}...

🔗 More Info: ${data.url}

╰━━━〔 ⚡ Frontier MD 〕━━━⬣
powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-tech`;

        await conn.sendMessage(from, {
            image: { url: data.images.jpg.image_url },
            caption: caption,
            footer: "Tap below for another anime 🎴",
            buttons: [
                {
                    buttonId: ".anime",
                    buttonText: { displayText: "🎲 Next Anime" },
                    type: 1
                }
            ],
            headerType: 4
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Failed to fetch anime.");
    }
});
