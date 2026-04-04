import { jidNormalizedUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, isOwner }) => {
    if (!isOwner) return m.reply('❌ This command is for owner only.')

    let number = null

    // Priority: Quoted > Mention > Text input
    if (m.quoted?.sender) {
        number = m.quoted.sender
    } 
    else if (m.mentionedJid?.length) {
        number = m.mentionedJid[0]
    } 
    else if (text) {
        const cleaned = text.replace(/[^0-9]/g, '')
        if (cleaned.length < 8) {
            return m.reply('⚠️ Please provide a valid phone number (min 8 digits).')
        }
        number = cleaned + '@s.whatsapp.net'
    } 
    else {
        return m.reply('⚠️ *Usage:*\n• Reply to a message\n• Mention someone\n• .block 263789699200\nExample: .block 263789699200')
    }

    // 🔥 CRITICAL FIX: Always normalize JID first
    const userJid = jidNormalizedUser(number)
    const phone = userJid.split('@')[0]

    // Safety: Prevent self-block (very common mistake)
    if (userJid === conn.user?.id || userJid === conn.user?.jid) {
        return m.reply('❌ Nice try, Onichan\~ You can\'t block the bot itself 💀')
    }

    try {
        await conn.updateBlockStatus(userJid, "block")

        // 🔥 Your original edgy style preserved + fixed wa.me link
        await conn.sendMessage(m.chat, {
            text: `╭━━━〔 ⚔️ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ⚔️ 〕━━━⬣
┃ 🚫 *TARGET ELIMINATED*
┃
┃ 🗑️ The trash has been blocked…
┃ 🖤 *Onichan\~* ✨
┃
┃ ⚡ User: wa.me/${phone}
╰━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: m })

        console.log(`✅ [BLOCK] Owner blocked: ${userJid}`)

    } catch (err) {
        console.error('[BLOCK ERROR]', err)
        m.reply('❌ Failed to block user. Check console for details.')
    }
}

handler.command = ['block']
handler.owner = true
handler.help = ['block <number / reply / mention>']
handler.tags = ['owner']

export default handler
