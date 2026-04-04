const { jidNormalizedUser } = require('@whiskeysockets/baileys')

let handler = async (m, { conn, text, isOwner }) => {
    if (!isOwner) return m.reply('❌ This command is for owner only')

    let number

    if (m.quoted) {
        number = m.quoted.sender
    } 
    else if (text) {
        number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    } 
    else {
        return m.reply('⚠️ Reply to a user or type a number\nExample: .block 263789699200')
    }

    try {
        let user = jidNormalizedUser(number)

        await conn.updateBlockStatus(user, "block")

        await conn.sendMessage(m.chat, {
            text: `╭━━━〔 ⚔️ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ⚔️ 〕━━━⬣
┃ 🚫 *TARGET ELIMINATED*
┃
┃ 🗑️ The trash has been blocked…
┃ 🖤 *Onichan~* ✨
┃
┃ ⚡ User: wa.me/${number.replace('@s.whatsapp.net', '')}
╰━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: m })

    } catch (e) {
        m.reply('❌ Failed to block user')
        console.log(e)
    }
}

handler.command = ['block']
handler.owner = true

module.exports = handler
