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

        const res = await axios.get(
            "https://api.giftedtech.co.ke/api/download/facebookv3",
            {
                params: {
                    apikey: "gifted",
                    url: q
                }
            }
        );

        const data = res.data;

        console.log(data); // 🔍 keep this for debugging

        if (!data || !data.status) {
            return reply("❌ Failed to fetch video")
        }

        // ✅ Flexible extraction (API may change keys)
        const videoUrl =
            data.result?.hd ||
            data.result?.sd ||
            data.result?.video ||
            data.result?.url;

        if (!videoUrl) {
            return reply("❌ No video found")
        }

        const shortLink = q.length > 40 ? q.slice(0, 40) + '...' : q;

        const caption = `╭━━━〔 ⚡ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ⚡ 〕━━━⬣
┃ 🎬 FACEBOOK VIDEO ACQUIRED
┃━━━━━━━━━━━━━━━━━━━⬣
┃ 🔗 ${shortLink}
┃
┃ 📡 Status: SUCCESS ✅
┃ ⚙️ Source: FB V3 API
┃
┃ ⚡ System: ONLINE
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
