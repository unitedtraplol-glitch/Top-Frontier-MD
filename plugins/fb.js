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

        const api = `https://api.giftedtech.co.ke/api/download/facebook?apikey=gifted&url=${encodeURIComponent(q)}`
        
        const res = await axios.get(api)
        const data = res.data

        if (!data.status) {
            return reply("❌ Failed to fetch video")
        }

        const videoUrl = data.result.video

        if (!videoUrl) {
            return reply("❌ No video found")
        }

        const shortLink = q.length > 40 ? q.slice(0, 40) + '...' : q

        const caption = `╭━━━〔 ⚡ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ⚡ 〕━━━⬣
┃ 🎬 FACEBOOK VIDEO ACQUIRED
┃━━━━━━━━━━━━━━━━━━━⬣
┃ 🔗 ${shortLink}
┃
┃ 📡 Status: SUCCESS ✅
┃ ⚙️ Quality: AUTO
┃
┃ ⚡ System: ONLINE
╰━━━━━━━━━━━━━━━━━━━⬣

🖤 _Onichan~ your video is ready..._ ✨`

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: caption
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply("❌ Error downloading video")
    }
});
