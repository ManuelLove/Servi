const fetch = require('node-fetch');

async function ytmp3(m, { text }) {
    if (!text) return m.reply("🔹 Debes proporcionar una URL de YouTube.");
    if (!text.includes("youtube.com") && !text.includes("youtu.be")) return m.reply("❌ URL no válida.");

    m.reply("⌛ Descargando audio, por favor espera...");
    
    try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${text}`);
        let data = await response.json();

        if (data.status && data.data.dl) {
            let audioUrl = data.data.dl;
            conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: m });
        } else {
            m.reply("❌ No se pudo descargar el audio.");
        }
    } catch (err) {
        console.error("Error en ytmp3:", err);
        m.reply("❌ Ocurrió un error al procesar tu solicitud.");
    }
}

module.exports = { handler: ytmp3, command: ['ytmp3'] };
