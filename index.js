
const fs = require('fs');
const axios = require('axios');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');

async function ytsearch(query) {
    console.log("🔎 Buscando en YouTube:", query);
    try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/ytsearch?query=${encodeURIComponent(query)}`);
        let data = await response.json();
        return data;
    } catch (err) {
        console.error("❌ Error en ytsearch:", err);
        return null;
    }
}

async function ytmp3(text, conn, m) {
    console.log("✅ Ejecutando ytmp3 con URL:", text);
    if (!text) return m.reply("🔹 Debes proporcionar una URL de YouTube.");
    
    m.reply("⌛ Cargando...
▰▰▰▰▰▰▰▰▱");

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
            const audioResponse = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });
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
}

async function ytmp4(text, conn, m) {
    console.log("✅ Ejecutando ytmp4 con URL:", text);
    if (!text) return m.reply("🔹 Debes proporcionar una URL de YouTube.");

    m.reply("⌛ Cargando...
▰▰▰▰▰▰▰▰▱");

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
            const videoResponse = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });
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
}

module.exports = { ytsearch, ytmp3, ytmp4 };
