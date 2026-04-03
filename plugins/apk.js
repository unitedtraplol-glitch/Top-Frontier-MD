const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "apk",
    alias: ["app"],
    desc: "Download APK files",
    category: "download",
    react: "📦",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Enter app name\nExample: .apk whatsapp");

        // fetch API
        let res = await fetch(`https://eliteprotech-apis.zone.id/apk?q=${encodeURIComponent(q)}`);
        let data = await res.json();

        if (!data.status || !data.results.length) {
            return reply("❌ App not found");
        }

        let app = data.results[0];

        let name = app.name;
        let version = app.file.vername;
        let size = (app.size / 1024 / 1024).toFixed(2) + " MB";
        let developer = app.developer.name;
        let link = app.file.path;

        // styled caption
        let caption = `╭━━━〔 📱 APK DOWNLOADER 〕━━━⬣

📛 Name: ${name}
📦 Version: ${version}
📁 Size: ${size}
👨‍💻 Developer: ${developer}

⬇️ Sending APK...

╰━━━〔 ⚡ Frontier MD 〕━━━⬣

powered by 𝕗𝕽𝕠𝕟𝕥𝕚𝕖𝕣-tech`;

        // send image preview + caption
        await conn.sendMessage(from, {
            image: { url: app.graphic || app.icon },
            caption: caption
        }, { quoted: mek });

        // send APK file
        await conn.sendMessage(from, {
            document: { url: link },
            mimetype: "application/vnd.android.package-archive",
            fileName: `${name}.apk`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Error fetching APK");
    }
});
