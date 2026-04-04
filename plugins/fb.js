let handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('⚠️ Send a Facebook link\nExample:\n.fb https://facebook.com/...')
    }

    try {
        let api = `https://api.giftedtech.co.ke/api/download/facebook?apikey=gifted&url=${encodeURIComponent(text)}`
        
        let res = await fetch(api)
        let data = await res.json()

        if (!data.status) {
            return m.reply('❌ Failed to fetch video')
        }

        let videoUrl = data.result.video

        if (!videoUrl) {
            return m.reply('❌ No video found')
        }

        let shortLink = text.length > 40 ? text.slice(0, 40) + '...' : text

        // ✅ USING YOUR BOT STYLE
        await conn.sendFile(
            m.chat,
            videoUrl,
            'fb.mp4',
            `╭━━━〔 ⚡ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ⚡ 〕━━━⬣
┃ 🎬 FACEBOOK VIDEO ACQUIRED
┃━━━━━━━━━━━━━━━━━━━⬣
┃ 🔗 ${shortLink}
┃
┃ 📡 Status: SUCCESS ✅
┃ ⚙️ Quality: AUTO
┃
┃ ⚡ System: ONLINE
╰━━━━━━━━━━━━━━━━━━━⬣

🖤 _Onichan~ your video is ready..._ ✨`,
            m
        )

    } catch (e) {
        console.log(e)
        m.reply('❌ Error downloading video')
    }
}

handler.command = ['fb']

module.exports = handler
