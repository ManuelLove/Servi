const fetch = require('node-fetch');

async function ytmp4(m, { text }) {
    if (!text) return m.reply("🔹 Debes proporcionar una URL de YouTube.");
    if (!text.includes("youtube.com") && !text.includes("youtu.be")) return m.reply("❌ URL no válida.");

    m.reply("⌛ Descargando video, por favor espera...");
    
    try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${text}`);
        let data = await response.json();

        if (data.status && data.data.dl) {
            let videoUrl = data.data.dl;
            conn.sendMessage(m.chat, { video: { url: videoUrl }, mimetype: 'video/mp4' }, { quoted: m });
        } else {
            m.reply("❌ No se pudo descargar el video.");
        }
    } catch (err) {
        console.error("Error en ytmp4:", err);
        m.reply("❌ Ocurrió un error al procesar tu solicitud.");
    }
}

module.exports = { handler: ytmp4, command: ['ytmp4'] };
