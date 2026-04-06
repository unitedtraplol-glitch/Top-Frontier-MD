const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "menu",
    desc: "Show menu",
    category: "menu",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from }) => {

    const botName = conn.user?.name || "Unknown";

    // ✅ NEWSLETTER
    const contextInfo = {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363406015082072@newsletter",
            newsletterName: "𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-MD",
            serverMessageId: 143
        }
    };

    // ✅ YOUR EXACT DESIGN
    const menu = `
╔════════════════════════════════════════════╗
║ ▓▓▓▒▒░░ ⟦ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-MD CORE v7.0 ⟧ ░░▒▒▓▓▓ ║
╚════════════════════════════════════════════╝

> INITIALIZING SYSTEM CORE...
> LOADING MODULES ██████████ 100%
> BYPASSING SECURITY...
> ACCESS GRANTED ☠️

┌──〔 ⚙️ SYSTEM DIAGNOSTICS 〕──┐
│ ◈ USER        : ${botName}
│ ◈ PREFIX      : ${config.PREFIX}
│ ◈ ENGINE      : 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-md
│ ◈ STATUS      : ONLINE
│ ◈ POWER LEVEL : ██████████ MAX
└──────────────────────────────┘

╔═══════〔 📡 COMMAND PROTOCOLS 〕═══════╗

┏━┉┉┉┉『 📥 DOWNLOAD ZONE 』┉┉┉┉━┓
┃ ✦ facebook      ✦ mediafire
┃ ✦ tiktok        ✦ twitter
┃ ✦ insta         ✦ pinterest
┃ ✦ spotify       ✦ play
┃ ✦ play2-10      ✦ song
┃ ✦ audio         ✦ video
┃ ✦ video2-10     ✦ ytmp3
┃ ✦ ytmp4         ✦ darama
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 👥 GROUP CONTROL 』┉┉┉┉━┓
┃ ✦ grouplink     ✦ add
┃ ✦ remove        ✦ kick
┃ ✦ kickall       ✦ kickall2
┃ ✦ kickall3      ✦ promote
┃ ✦ demote        ✦ dismiss
┃ ✦ revoke        ✦ mute
┃ ✦ unmute        ✦ lockgc
┃ ✦ unlockgc      ✦ tag
┃ ✦ hidetag       ✦ tagall
┃ ✦ tagadmins     ✦ invite
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 😈 FUN CHAOS 』┉┉┉┉━┓
┃ ✦ shapar        ✦ rate
┃ ✦ insult        ✦ hack
┃ ✦ ship          ✦ character
┃ ✦ pickup        ✦ joke
┃ ✦ hrt           ✦ hpy
┃ ✦ syd           ✦ anger
┃ ✦ shy           ✦ kiss
┃ ✦ mon           ✦ cunfuzed
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 👑 OWNER ACCESS 』┉┉┉┉━┓
┃ ✦ block         ✦ unblock
┃ ✦ restart       ✦ shutdown
┃ ✦ setpp         ✦ fullpp
┃ ✦ updatecmd     ✦ gjid
┃ ✦ jid           ✦ listcmd
┃ ✦ allmenu
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 🤖 AI MATRIX 』┉┉┉┉━┓
┃ ✦ ai            ✦ gpt
┃ ✦ gpt2          ✦ gpt3
┃ ✦ gptmini       ✦ meta
┃ ✦ imagine       ✦ imagine2
┃ ✦ blackbox      ✦ luma
┃ ✦ dj            ✦ khan
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 🎎 ANIME CORE 』┉┉┉┉━┓
┃ ✦ waifu         ✦ neko
┃ ✦ maid          ✦ loli
┃ ✦ fack          ✦ dog
┃ ✦ awoo          ✦ garl
┃ ✦ foxgirl       ✦ naruto
┃ ✦ animegirl     ✦ anime1-5
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 🔄 CONVERT LAB 』┉┉┉┉━┓
┃ ✦ sticker       ✦ sticker2
┃ ✦ emojimix      ✦ take
┃ ✦ tomp3         ✦ fancy
┃ ✦ tts           ✦ trt
┃ ✦ base64        ✦ unbase64
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 📌 UTILITY CORE 』┉┉┉┉━┓
┃ ✦ timenow       ✦ date
┃ ✦ count         ✦ calculate
┃ ✦ flip          ✦ coinflip
┃ ✦ rcolor        ✦ roll
┃ ✦ fact          ✦ define
┃ ✦ news          ✦ movie
┃ ✦ weather
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 💞 REACTION ENGINE 』┉┉┉┉━┓
┃ ✦ cuddle        ✦ hug
┃ ✦ kiss          ✦ lick
┃ ✦ pat           ✦ bully
┃ ✦ bonk          ✦ yeet
┃ ✦ slap          ✦ kill
┃ ✦ blush         ✦ smile
┃ ✦ happy         ✦ wink
┃ ✦ poke
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━┉┉┉┉『 🏠 CORE SYSTEM 』┉┉┉┉━┓
┃ ✦ ping          ✦ live
┃ ✦ alive         ✦ runtime
┃ ✦ uptime        ✦ repo
┃ ✦ owner         ✦ menu
┗━━━━━━━━━━━━━━━━━━━━━━━┛

╚═══════〔 ☠️ SYSTEM TERMINAL 〕═══════╝
> STATUS: SHADOW ADMIN
> ACCESS: UNRESTRICTED

⚡ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-md-tech
`;

    try {
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/asboiz.jpeg" },
            caption: menu,
            contextInfo
        }, { quoted: mek });

        await new Promise(r => setTimeout(r, 700));

        await conn.sendMessage(from, {
            audio: { url: "https://files.catbox.moe/7dznqi.opus" },
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            contextInfo
        }, { quoted: mek });

    } catch (e) {
        await conn.sendMessage(from, {
            text: menu,
            contextInfo
        }, { quoted: mek });
    }

});
