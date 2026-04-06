const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "video",
    desc: "Download YouTube video",
    category: "download",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    if (!q) return reply("Give me a video name 😒");

    try {

        // 🔍 SEARCH
        const res = await axios.get(`https://eliteprotech-apis.zone.id/ytsearch?q=${encodeURIComponent(q)}`);
        const data = res.data;

        if (!data || !data.result || data.result.length === 0) {
            return reply("No results found 😭");
        }

        const video = data.result[0];

        const title = video.title;
        const thumbnail = video.thumbnail;

        // 🎥 GET VIDEO LINK (auto fallback)
        const videoUrl =
            video.video ||
            video.mp4 ||
            video.download ||
            video.url;

        // 📸 PREVIEW FIRST
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: `🎬 *${title}*\n\n> downloading video...`
        }, { quoted: mek });

        // 🎥 SEND VIDEO
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            caption: `🎬 ${title}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error downloading video 😭");
    }

});
