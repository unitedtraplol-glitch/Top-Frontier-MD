const axios = require("axios");

module.exports = {
  name: "anime",
  alias: ["ani"],
  desc: "Get anime info",
  category: "anime",
  react: "🎴",

  async execute(sock, m, args) {
    try {
      let query = args.join(" ");

      let url = query
        ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`
        : `https://api.jikan.moe/v4/random/anime`;

      let res = await axios.get(url);
      let data = query ? res.data.data[0] : res.data.data;

      if (!data) return m.reply("❌ Anime not found!");

      // ✅ SAFE IMAGE (FIX)
      let image =
        data.images?.jpg?.large_image_url ||
        data.images?.jpg?.image_url ||
        "https://i.imgur.com/1bX5QH6.jpg"; // fallback image

      // ✅ LIMIT DESCRIPTION
      let desc = data.synopsis || "No description available";
      if (desc.length > 500) {
        desc = desc.substring(0, 500) + "...";
      }

      // 🎨 STYLED MESSAGE
      let caption = `
┏━━━━━━━━━━━━━━━━━━━⬣
┃ 🎴 *ANIME PROFILE*
┗━━━━━━━━━━━━━━━━━━━⬣

┃ 📛 *Title:* ${data.title}
┃ 🎬 *Type:* ${data.type}
┃ 📺 *Episodes:* ${data.episodes || "N/A"}
┃ ⭐ *Rating:* ${data.score || "N/A"}
┃ 📡 *Status:* ${data.status}

┣━━━━━━━━━━━━━━━━━━━⬣
┃ 📖 *Synopsis*
┃ ${desc}

┣━━━━━━━━━━━━━━━━━━━⬣
┃ 🔗 *More Info:*
┃ ${data.url}

┗━━━━━━━━━━━━━━━━━━━⬣
⚡ *Frontier MD*
╰─➤ powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-tech
`;

      // 🔘 BUTTONS
      const buttons = [
        {
          buttonId: `.anime`,
          buttonText: { displayText: "🎲 Random" },
          type: 1,
        },
        {
          buttonId: `.anime naruto`,
          buttonText: { displayText: "🔍 Naruto" },
          type: 1,
        },
      ];

      // ✅ SEND MESSAGE (SAFE)
      await sock.sendMessage(
        m.chat,
        {
          image: { url: image },
          caption: caption,
          buttons: buttons,
          headerType: 4,
        },
        { quoted: m }
      );

    } catch (err) {
      console.log("ANIME ERROR:", err);

      // 🔥 IMPORTANT: show error instead of silent fail
      await m.reply("❌ Anime command error. Check logs.");
    }
  },
};
