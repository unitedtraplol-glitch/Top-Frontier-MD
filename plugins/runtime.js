const { runtime } = require('../lib/functions')
const os = require('os')

module.exports = {
  pattern: "runtime",
  alias: ["uptime", "alive"],
  react: "⚡",

  async function(sock, m, msg, { reply }) {
    try {
      // 🛑 CHECK CONNECTION FIRST
      if (!sock?.user) {
        return reply("⚠️ Bot is still connecting, try again...")
      }

      const uptime = runtime(process.uptime())
      const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0)
      const freeMem = (os.freemem() / 1024 / 1024).toFixed(0)

      const caption = `
╭━━━〔 ⚡ FRONTIER MD STATUS ⚡ 〕━━━⬣
┃ ⏳ Uptime    : ${uptime}
┃ 💾 RAM Usage : ${freeMem}/${totalMem} MB
┃ 📡 Status    : Online 🟢
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`

      // 🖼️ SEND IMAGE SAFELY
      await sock.sendMessage(m.key.remoteJid, {
        image: { url: "https://files.catbox.moe/ggcgdm.jpeg" },
        caption: caption,
        contextInfo: {
          externalAdReply: {
            title: "Join My WhatsApp Channel 🚀",
            body: "Tap to open channel",
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnailUrl: "https://files.catbox.moe/ggcgdm.jpeg",
            sourceUrl: "https://whatsapp.com/channel/120363406015082072"
          }
        }
      }, { quoted: m })

      // ⏳ WAIT BEFORE SENDING AUDIO (VERY IMPORTANT)
      await new Promise(res => setTimeout(res, 1500))

      // 🎧 SEND AUDIO SAFELY
      await sock.sendMessage(m.key.remoteJid, {
        audio: { url: "https://files.catbox.moe/84s5w1.opus" },
        mimetype: "audio/ogg; codecs=opus",
        ptt: true
      }, { quoted: m })

    } catch (err) {
      console.log("RUNTIME ERROR:", err)

      // fallback (prevents crash)
      reply("⚠️ Runtime loaded but media failed. Try again.")
    }
  }
}
