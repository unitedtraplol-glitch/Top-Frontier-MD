const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

const DL_API = 'https://meta.davidxtech.de/api/yt/play?q=';
const API_KEY = 'xbps-install-Syu';

cmd({
    pattern: "play",
    alias: ["plays", "music"],
    desc: "Search and download a song as MP3 from YouTube",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        const query = args.join(' ');
        
        if (!query) {
            return reply("🎵 *Which song do you want to play?*\nUsage: .play <song name>");
        }

        reply("🔍 *Searching...* ⏳");

        const { videos } = await yts(query);
        if (!videos || !videos.length) {
            return reply("❌ *No results found!* 😞");
        }

        const video = videos[0];
        
        reply(`✅ *Found:* ${video.title} 🎵\n⏱️ ${video.timestamp}\n👤 ${video.author.name}\n\n⏳ *Downloading... (may take up to 30s)*`);

        // Download function with retry
        const downloadSong = async (url, retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    const { data } = await axios.get(DL_API, {
                        params: { apiKey: API_KEY, format: 'mp3', url },
                        timeout: 90000
                    });
                    if (data?.data?.downloadUrl) return data.data;
                    throw new Error('No download URL');
                } catch (err) {
                    if (i === retries - 1) throw err;
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        };

        const songData = await downloadSong(video.url);

        // Get thumbnail
        let thumbnailBuffer;
        try {
            const img = await axios.get(songData.thumbnail, { responseType: 'arraybuffer', timeout: 15000 });
            thumbnailBuffer = Buffer.from(img.data);
        } catch (e) {}

        await conn.sendMessage(from, {
            audio: { url: songData.downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${songData.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: songData.title,
                    body: `${video.author.name} • ${video.timestamp}`,
                    thumbnail: thumbnailBuffer,
                    mediaType: 2,
                    sourceUrl: video.url
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error('Play error:', err.message);
        reply(`❌ *Failed:* ${err.message} 😞`);
    }
});
