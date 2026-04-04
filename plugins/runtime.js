const { runtime } = require('../lib/functions')
const os = require('os')

module.exports = {
  pattern: "runtime",
  alias: ["uptime", "alive"],
  desc: "Check bot uptime",
  category: "general",
  react: "⚡",

  async function(sock, m, msg, { reply }) {
    try {
      const uptime = runtime(process.uptime())
      const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0)
      const freeMem = (os.freemem() / 1024 / 1024).toFixed(0)

      const caption = `
╭━━━〔 ⚡ FRONTIER MD STATUS ⚡ 〕━━━⬣
┃ 🤖 Bot Name  : Frontier MD
┃ ⏳ Uptime    : ${uptime}
┃ 💾 RAM Usage : ${freeMem}MB / ${totalMem}MB
┃ 📡 Status    : Online 🟢
╰━━━━━━━━━━━━━━━━━━━━━━⬣

> 🚀 Tap below to join my WhatsApp Channel 🔥
`

      // 🔥 SEND IMAGE WITH NEWSLETTER LINK
      await sock.sendMessage(m.key.remoteJid, {
        image: { url: "https://files.catbox.moe/ggcgdm.jpeg" },
        caption: caption,
        contextInfo: {
          externalAdReply: {
            title: "🚀 Join Frontier MD Channel",
            body: "Tap here to open WhatsApp Channel",
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnailUrl: "https://files.catbox.moe/ggcgdm.jpeg",
            sourceUrl: "https://whatsapp.com/channel/120363406015082072"
          }
        }
      }, { quoted: m })

      // 🎧 SEND AUDIO AFTER IMAGE
      await sock.sendMessage(m.key.remoteJid, {
        audio: { url: "https://files.catbox.moe/84s5w1.opus" },
        mimetype: "audio/ogg; codecs=opus",
        ptt: true // makes it voice note style 🔥
      }, { quoted: m })

    } catch (err) {
      console.log(err)
      reply("❌ Error displaying runtime")
    }
  }
}
