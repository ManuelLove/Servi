
import fetch from 'node-fetch';
import fs from 'fs';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';

case 'ytmpa': {
    console.log("✅ Ejecutando ytmp3 con URL:", text);
    if (!text) return m.reply("🔹 Debes proporcionar una URL de YouTube.");
    if (!isUrl(text)) return m.reply("❌ URL no válida.");

    m.reply("⌛ Cargando audio...");

    try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${text}`);
        let data = await response.json();

        if (data.status && data.data.dl) {
            const fileUrl = data.data.dl;
            const uniqueId = Date.now(); 
            const fileName = `audio_${uniqueId}.mp3`;
            const fixedFileName = `fixed_audio_${uniqueId}.mp3`;
            const filePath = `${__dirname}/${fileName}`;
            const fixedFilePath = `${__dirname}/${fixedFileName}`;

            console.log('⏳ Descargando archivo de audio...');
            const writer = fs.createWriteStream(filePath);
            const audioResponse = await axios({
                url: fileUrl,
                method: 'GET',
                responseType: 'stream',
            });
            audioResponse.data.pipe(writer);

            writer.on('finish', () => {
                console.log('✅ Archivo descargado. Iniciando conversión...');
                ffmpeg(filePath)
                    .toFormat('mp3')
                    .on('end', () => {
                        console.log('✅ Conversión completada. Enviando archivo...');
                        conn.sendMessage(m.chat, {
                            audio: fs.readFileSync(fixedFilePath),
                            mimetype: 'audio/mpeg',
                            fileName: `audio_${uniqueId}.mp3`,
                        }, { quoted: m });

                        fs.unlinkSync(filePath);
                        fs.unlinkSync(fixedFilePath);
                    })
                    .save(fixedFilePath);
            });

        } else {
            m.reply("❌ Error al descargar el audio.");
        }
    } catch (err) {
        console.error("❌ Error en ytmp3:", err);
        m.reply("❌ Hubo un problema al procesar tu solicitud.");
    }
    console.log("✅ Comando ytmp3 finalizado.");
}
break;
