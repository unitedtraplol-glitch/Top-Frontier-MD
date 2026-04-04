const { cmd } = require("../command");

cmd({
    pattern: "unblock",
    desc: "Unblock a user",
    category: "owner",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Owner only command");

        let user;

        if (mek.quoted) {
            user = mek.quoted.sender;
        } else if (q) {
            let number = q.replace(/[^0-9]/g, "");
            user = number + "@s.whatsapp.net";
        } else {
            return reply("⚠️ Reply or give number\nExample: .unblock 2637xxxxxxx");
        }

        await conn.updateBlockStatus(user, "unblock");

        await conn.sendMessage(from, {
            text: `╭━━━〔 ⚡ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ⚡ 〕━━━⬣
┃ ✅ TARGET RESTORED
┃━━━━━━━━━━━━━━━━━━━⬣
┃ 💬 User can now interact again
┃
┃ ⚡ User: wa.me/${user.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Failed to unblock user");
    }
});
