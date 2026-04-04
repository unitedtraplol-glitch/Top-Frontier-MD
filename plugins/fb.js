const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "fb",
    desc: "Download Facebook videos",
    category: "download",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply("⚠️ Send a Facebook link\nExample:\n.fb https://facebook.com/...")
        }

        // ✅ CLEAN PARAM STYLE
        const res = await axios.get(
            "https://meta.davidxtech.de/api/facebook/download",
            {
                params: { url: q }
            }
        );

        const data = res.data;

        console.log(data); // 👈 helps debug

        if (!data || !data.result) {
            return reply("❌ Failed to fetch video")
        }

        // ⚠️ API might return different keys
        const videoUrl =
            data.result.hd ||
            data.result.sd ||
            data.result.video ||
            data.result.url;

        if (!videoUrl) {
            return reply("❌ No video found")
        }

        const caption = `╭━━━〔 ⚡ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ⚡ 〕━━━⬣
┃ 🎬 FACEBOOK VIDEO DOWNLOADED
┃━━━━━━━━━━━━━━━━━━━⬣
┃ 🔗 ${q.length > 40 ? q.slice(0, 40) + '...' : q}
┃
┃ 📡 Status: SUCCESS ✅
╰━━━━━━━━━━━━━━━━━━━⬣

🖤 _Onichan~ your video is ready..._ ✨`;

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Error downloading video");
    }
});
