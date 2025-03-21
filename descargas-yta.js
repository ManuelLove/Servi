import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

var handler = async (m, { text, conn, args, usedPrefix, command }) => {

if (!args[0]) return conn.reply(m.chat, '🎌 *Ingrese el comando más un enlace de YouTube*', m)

let youtubeLink = args[0]

await conn.reply(m.chat, `⏰ Espere un momento`, m)

try {
    let apiUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${youtubeLink}`;
    let response = await fetch(apiUrl);
    let data = await response.json();

    console.log("Respuesta de la API:", data); // Depuración

    if (data.status && data.data.dl) {
        let audioUrl = data.data.dl;
        let titulo = data.data.title || 'audio';
        let filePath = path.join('/tmp', `${titulo}.mp3`);

        // Descargar el archivo antes de enviarlo
        let audioResponse = await fetch(audioUrl);
        let buffer = await audioResponse.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        // Enviar el archivo descargado
        await conn.sendFile(m.chat, filePath, `${titulo}.mp3`, null, m, false, { mimetype: 'audio/mpeg' });

        // Eliminar el archivo después de enviarlo
        fs.unlinkSync(filePath);
    } else {
        await conn.reply(m.chat, '🚩 *Error: No se encontró un enlace de descarga válido.*', m);
    }
} catch (error) {
    console.error("Error en la descarga de audio:", error);
    await conn.reply(m.chat, '🚩 *Ocurrió un fallo al descargar el audio.*', m);
}}

handler.help = ['yta']
handler.tags = ['descargas']
handler.command = /^audio|fgmp3|dlmp3|getaud|yt(a|mp3)$/i

handler.register = true
handler.limit = true

export default handler
