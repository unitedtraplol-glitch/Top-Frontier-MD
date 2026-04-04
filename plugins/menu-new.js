const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "menu",
    desc: "Show full command menu",
    category: "menu",
    react: "🧾",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {

        const menuCaption = `
╔═━━━═══━━━═══━━━═╗
🌒 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-MD-BOT 💫
╚═━━━═══━━━═══━━━═╝

╭─⟡⃟『 SYSTEM INFO 』⟡⃟─╮
│ ⟡⃟ 🌒SYSTEM BREACH DETECTED
│ ⟡⃟ 🌀HOST: *${config.OWNER_NAME}*
│ ⟡⃟ 🦈STATUS: ██████████ 100%
╰─⟡⃟════════════════⟡⃟─╯

        ⛧ 「🔪 𝘼𝙒𝘼𝙆𝙀𝙉 🚧」 ⛧

╭─❖『 📥 DOWNLOAD ZONE 』❖─╮
│ ✧ facebook
│ ✧ tiktok
│ ✧ mediafire
│ ✧ twitter
│ ✧ spotify
│ ✧ play
│ ✧ song
│ ✧ video
│ ✧ ytmp3
│ ✧ ytmp4
╰─❖════════════════❖─╯

╭─❖『 👥 GROUP COMMAND 』❖─╮
│ ✧ grouplink
│ ✧ kick
│ ✧ add
│ ✧ remove
│ ✧ promote
│ ✧ demote
│ ✧ mute
│ ✧ unmute
│ ✧ tagall
│ ✧ hidetag
╰─❖════════════════❖─╯

╭─❖『 🎭 FUN CHAOS 』❖─╮
│ ✧ joke
│ ✧ pickup
│ ✧ hack
│ ✧ insult
│ ✧ ship
│ ✧ rate
╰─❖════════════════❖─╯

╭─❖『 👑 OWNER DOMAIN 』❖─╮
│ ✧ block
│ ✧ unblock
│ ✧ restart
│ ✧ shutdown
│ ✧ setpp
│ ✧ fullpp
│ ✧ updatecmd
│ ✧ listcmd
╰─❖════════════════❖─╯

╭─❖『 🤖 AI MATRIX 』❖─╮
│ ✧ ai
│ ✧ gpt
│ ✧ gpt3
│ ✧ gptmini
│ ✧ imagine
│ ✧ blackbox
╰─❖════════════════❖─╯

╭─❖『 🎎 ANIME CORE 』❖─╮
│ ✧ waifu
│ ✧ neko
│ ✧ maid
│ ✧ loli
│ ✧ naruto
│ ✧ animegirl
╰─❖════════════════❖─╯

╭─❖『 🔄 CONVERT LAB 』❖─╮
│ ✧ sticker
│ ✧ emojimix
│ ✧ tomp3
│ ✧ fancy
│ ✧ tts
│ ✧ base64
╰─❖════════════════❖─╯

╭─❖『 📌 UTILITY CORE 』❖─╮
│ ✧ timenow
│ ✧ date
│ ✧ calculate
│ ✧ flip
│ ✧ fact
│ ✧ weather
╰─❖════════════════❖─╯

╭─❖『 💞 REACTION ENGINE 』❖─╮
│ ✧ hug
│ ✧ kiss
│ ✧ cuddle
│ ✧ slap
│ ✧ bully
│ ✧ poke
╰─❖════════════════❖─╯

╭─❖『 🏠 MAIN SYSTEM 』❖─╮
│ ✧ ping
│ ✧ alive
│ ✧ runtime
│ ✧ owner
│ ✧ repo
│ ✧ menu
╰─❖════════════════❖─╯

╭─⛧『 FINAL STATUS 』⛧─╮
│ ☠️ You are now bound to the system
│ ⚡ All commands unlocked
╰─⛧════════════════⛧─╯

> ${config.DESCRIPTION}
`;

        const contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363406015082072@newsletter',
                newsletterName: config.OWNER_NAME,
                serverMessageId: 143
            }
        };

        // Send menu (image or fallback to text)
        try {
            await conn.sendMessage(
                from,
                {
                    image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/asboiz.jpeg' },
                    caption: menuCaption,
                    contextInfo: contextInfo
                },
                { quoted: mek }
            );

            // Optional voice after menu
            setTimeout(async () => {
                try {
                    await conn.sendMessage(from, {
                        audio: { url: 'https://files.catbox.moe/84s5w1.opus' },
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true,
                    }, { quoted: mek });
                } catch {}
            }, 1000);

        } catch {
            await conn.sendMessage(
                from,
                { text: menuCaption, contextInfo: contextInfo },
                { quoted: mek }
            );
        }

    } catch (e) {
        console.error('Menu Error:', e);
        await conn.sendMessage(
            from,
            { text: `❌ Menu error. Try again later.\n\n> ${config.DESCRIPTION}` },
            { quoted: mek }
        );
    }
});
