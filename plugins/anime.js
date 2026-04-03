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

        // 🔍 SEARCH
        if (args.length > 0) {
            const query = args.join(" ");
            const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
            data = res.data.data[0];

            if (!data) return reply("❌ Anime not found.");

        } else {
            // 🎲 RANDOM
            const res = await axios.get("https://api.jikan.moe/v4/random/anime");
            data = res.data.data;
        }

        // ✅ SAFE FALLBACKS
        const title = data.title || "Unknown";
        const type = data.type || "N/A";
        const episodes = data.episodes || "N/A";
        const rating = data.score || "N/A";
        const status = data.status || "Unknown";
        const synopsis = data.synopsis
            ? data.synopsis.substring(0, 200) + "..."
            : "No description available.";

        const image =
            data.images?.jpg?.image_url ||
            "https://i.imgur.com/6M513yH.png"; // fallback image

        const url = data.url || "";

        const caption = `╭━━━〔 🎴 ANIME INFO 〕━━━⬣

📛 *Title:* ${title}
🎬 *Type:* ${type}
📺 *Episodes:* ${episodes}
📊 *Rating:* ${rating}
📡 *Status:* ${status}

📖 *Story:* ${synopsis}

🔗 More Info: ${url}

╰━━━〔 ⚡ Frontier MD 〕━━━⬣
powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-tech`;

        // ✅ SEND MESSAGE (NO BUTTONS FIRST)
        await conn.sendMessage(from, {
            image: { url: image },
            caption: caption
        }, { quoted: mek });

    } catch (e) {
        console.log("ANIME ERROR:", e); // 👈 IMPORTANT
        reply("❌ Anime command failed. Try again.");
    }
});
