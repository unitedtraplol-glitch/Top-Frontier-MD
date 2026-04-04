const { mxd } = require("../command");

mxd(
  {
    pattern: "block",
    aliases: ["blockuser"],
    react: "🚫",
    category: "owner",
    description: "Block a user. Reply or provide number",
  },
  async (from, mek, conText) => {
    const {
      reply,
      react,
      isSuperUser,
      quotedUser,
      args,
      mentionedJid,
      superUser,
    } = conText;

    const { isJidGroup } = require("mrxd-baileys");
    const { convertLidToJid } = require("../king/connection/serializer");

    if (!isSuperUser) return reply("❌ Owner Only Command!");

    let targetJid;
    let rawTarget;

    if (quotedUser) {
      rawTarget = quotedUser;
    } else if (mentionedJid && mentionedJid.length > 0) {
      rawTarget = mentionedJid[0];
    } else if (args[0]) {
      rawTarget = args[0];
    } else if (!isJidGroup(from)) {
      rawTarget = from;
    }

    if (!rawTarget) {
      return reply("❌ Reply, mention or give a number!");
    }

    if (rawTarget.endsWith("@lid")) {
      const converted = convertLidToJid(rawTarget);
      if (converted) rawTarget = converted;
    }

    const num = rawTarget.split("@")[0].replace(/[^0-9]/g, "");
    if (!num || num.length < 6) {
      return reply("❌ Invalid number!");
    }

    targetJid = `${num}@s.whatsapp.net`;

    // ❌ Prevent blocking yourself/admins
    if (superUser && superUser.includes(targetJid)) {
      await react("❌");
      return reply("❌ Cannot block owner/sudo users!");
    }

    try {
      await mek.updateBlockStatus(targetJid, "block");

      await react("✅");
      return reply(
        `╭━━━〔 ⚔️ 𝕗𝕽𝕠𝕟𝕥𝕚𝕖r-MD ⚔️ 〕━━━⬣
┃ 🚫 TARGET ELIMINATED
┃━━━━━━━━━━━━━━━━━━━⬣
┃ 🗑️ The trash has been blocked…
┃ 🖤 Onichan~ ✨
┃
┃ ⚡ User: wa.me/${num}
╰━━━━━━━━━━━━━━━━━━━⬣`,
        { mentions: [targetJid] }
      );

    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to block: ${error.message}`);
    }
  }
);
