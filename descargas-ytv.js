
import fetch from 'node-fetch';
import fs from 'fs';
import axios from 'axios';

case 'ytmp4': {
    console.log("✅ Ejecutando ytmp4 con URL:", text);
    if (!text) return m.reply("🔹 Debes proporcionar una URL de YouTube.");
    if (!isUrl(text)) return m.reply("❌ URL no válida.");

    m.reply("⌛ Cargando video...");

    try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${text}`);
        let data = await response.json();

        if (data.status && data.data.dl) {
            const fileUrl = data.data.dl;
            const uniqueId = Date.now();
            const fileName = `video_${uniqueId}.mp4`;
            const filePath = `${__dirname}/${fileName}`;

            console.log('⏳ Descargando archivo de video...');
            const writer = fs.createWriteStream(filePath);
            const videoResponse = await axios({
                url: fileUrl,
                method: 'GET',
                responseType: 'stream',
            });
            videoResponse.data.pipe(writer);

            writer.on('finish', () => {
                console.log('✅ Video descargado. Enviando archivo...');
                conn.sendMessage(m.chat, {
                    video: fs.readFileSync(filePath),
                    mimetype: 'video/mp4',
                    fileName: `video_${uniqueId}.mp4`,
                }, { quoted: m });

                fs.unlinkSync(filePath);
            });

        } else {
            m.reply("❌ Error al descargar el video.");
        }
    } catch (err) {
        console.error("❌ Error en ytmp4:", err);
        m.reply("❌ Hubo un problema al procesar tu solicitud.");
    }
    console.log("✅ Comando ytmp4 finalizado.");
}
break;
