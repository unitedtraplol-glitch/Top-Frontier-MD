const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

const VIDEO_API = 'https://api.giftedtech.co.ke/api/download/ytmp4'; // confirm this with your friend

cmd({
    pattern: "video",
    alias: ["ytmp4", "mp4"],
    desc: "Download YouTube video",
    category: "download",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const query = args.join(' ');

        if (!query) {
            return reply("🎬 *Give a video name!*\nExample: .video faded alan walker");
        }

        // React
        await conn.sendMessage(from, {
            react: { text: "🔍", key: mek.key }
        });

        reply("🔍 *Searching video...*");

        const { videos } = await yts(query);

        if (!videos.length) {
            return reply("❌ *No results found!*");
        }

        const video = videos[0];

        // Limit duration (VERY IMPORTANT)
        if (video.seconds > 900) {
            return reply("❌ *Video too long! Max 15 minutes allowed.*");
        }

        reply(`✅ *Found:* ${video.title}\n⏱️ ${video.timestamp}\n\n⏳ *Downloading video...*`);

        const { data } = await axios.get(VIDEO_API, {
            params: { url: video.url },
            timeout: 60000
        });

        if (!data?.result?.download_url) {
            throw new Error("API failed");
        }

        const vid = data.result;

        // Send as DOCUMENT (safer for big files)
        await conn.sendMessage(from, {
            document: { url: vid.download_url },
            mimetype: 'video/mp4',
            fileName: `${vid.title}.mp4`,
            caption: `🎬 *${vid.title}*\n⏱️ ${vid.duration}\n📺 ${vid.quality}`,
            contextInfo: {
                externalAdReply: {
                    title: vid.title,
                    body: `Duration: ${vid.duration}`,
                    thumbnailUrl: vid.thumbnail,
                    mediaType: 2,
                    sourceUrl: video.url
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("Video error:", err);
        reply("❌ *Failed to download video. Try again later.*");
    }
});