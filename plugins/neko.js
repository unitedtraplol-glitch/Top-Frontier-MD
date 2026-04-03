import axios from "axios";

export default {
  name: "neko",
  alias: ["catgirl"],
  desc: "Get random SFW neko images 🐱",
  category: "fun",
  async execute(sock, m, args) {
    try {
      // API request
      const res = await axios.get("https://api.giftedtech.co.ke/api/anime/neko?apikey=gifted");

      const imageUrl = res.data.result;

      // Styled caption
      const caption = `╭━━━〔 🐱 NEKO IMAGE 〕━━━⬣

✨ Here's your random neko!

💖 Enjoy ~

╰━━━〔 ⚡ Frontier MD 〕━━━⬣
powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-tech`;

      // Send image
      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: imageUrl },
          caption: caption
        },
        { quoted: m }
      );

    } catch (err) {
      console.log(err);

      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Failed to fetch neko image. Try again later." },
        { quoted: m }
      );
    }
  }
};
