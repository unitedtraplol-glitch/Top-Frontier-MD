import axios from "axios";

export default {
  name: "anime",
  alias: ["ani", "randomanime"],
  desc: "Get anime info (random or search) 🎴",
  category: "fun",
  async execute(sock, m, args) {
    try {
      let data;
      let isSearch = args.length > 0;

      if (isSearch) {
        const query = args.join(" ");
        const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
        data = res.data.data[0];

        if (!data) {
          return sock.sendMessage(
            m.key.remoteJid,
            { text: "❌ Anime not found." },
            { quoted: m }
          );
        }

      } else {
        const res = await axios.get("https://api.jikan.moe/v4/random/anime");
        data = res.data.data;
      }

      // Extract data
      const title = data.title;
      const episodes = data.episodes || "N/A";
      const status = data.status;
      const rating = data.score || "N/A";
      const type = data.type;
      const synopsis = data.synopsis
        ? data.synopsis.slice(0, 200) + "..."
        : "No description";
      const image = data.images.jpg.image_url;
      const url = data.url;

      const caption = `╭━━━〔 🎴 ANIME INFO 〕━━━⬣

📛 *Title:* ${title}
🎬 *Type:* ${type}
📺 *Episodes:* ${episodes}
📊 *Rating:* ${rating}
📡 *Status:* ${status}

📖 *Story:* ${synopsis}

🔗 More Info: ${url}

╰━━━〔 ⚡ Frontier MD 〕━━━⬣
powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-tech`;

      // ✅ Send with button
      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: image },
          caption: caption,
          footer: "Tap below for another anime 🎴",
          buttons: [
            {
              buttonId: ".anime",
              buttonText: { displayText: "🎲 Next Anime" },
              type: 1
            }
          ],
          headerType: 4
        },
        { quoted: m }
      );

    } catch (err) {
      console.log(err);

      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Failed to fetch anime. Try again later." },
        { quoted: m }
      );
    }
  }
};
