const fetch = require('node-fetch')

let handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('⚠️ Please provide a Facebook link\n\nExample:\n.fb https://facebook.com/...')
    }

    try {
        let api = `https://api.giftedtech.co.ke/api/download/facebook?apikey=gifted&url=${encodeURIComponent(text)}`
        
        let res = await fetch(api)
        let data = await res.json()

        if (!data.success) {
            return m.reply('❌ Failed to fetch video')
        }

        let videoUrl = data.result.download_url || data.result.hd || data.result.sd

        if (!videoUrl) {
            return m.reply('❌ No video found')
        }

        // 🔥 Clean shortened link (so it looks nice)
        let shortLink = text.length > 40 ? text.slice(0, 40) + '...' : text

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `╭━━━〔 ⚡ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ENGINE ⚡ 〕━━━⬣
┃ 🎬 FACEBOOK VIDEO ACQUIRED
┃━━━━━━━━━━━━━━━━━━━⬣
┃ 🔗 ${shortLink}
┃
┃ 📡 Status: SUCCESSFULLY DOWNLOADED ✅
┃ ⚙️ Quality: AUTO
┃
┃ ⚡ System: ONLINE
╰━━━━━━━━━━━━━━━━━━━⬣

🖤 _Onichan~ your video is ready..._ ✨`
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        m.reply('❌ Error downloading video')
    }
}

handler.command = ['fb']

module.exports = handler
