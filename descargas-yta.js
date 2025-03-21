import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

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
        let titulo = data.data.title.replace(/[^a-zA-Z0-9]/g, "_") || 'audio'; // Evitar caracteres especiales en el nombre
        let filePath = path.join('/tmp', `${titulo}.mp3`);
        let convertedFilePath = path.join('/tmp', `fixed_${titulo}.mp3`);

        console.log("Descargando desde:", audioUrl);

        let audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            console.error("Error al descargar el archivo, respuesta no válida:", audioResponse.status);
            return conn.reply(m.chat, "🚩 Error al descargar el archivo.", m);
        }

        let buffer = await audioResponse.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        // Verificar si el archivo se guardó correctamente
        if (fs.existsSync(filePath)) {
            console.log("Archivo guardado en:", filePath);
            console.log("Convirtiendo audio para compatibilidad...");

            // Convertir el archivo con ffmpeg
            exec(`ffmpeg -i "${filePath}" -acodec libmp3lame -q:a 4 "${convertedFilePath}"`, async (error, stdout, stderr) => {
                if (error) {
                    console.error("Error en la conversión con ffmpeg:", error);
                    return conn.reply(m.chat, "🚩 Error al convertir el audio.", m);
                }

                console.log("Conversión completada. Enviando archivo...");

                let audioBuffer = fs.readFileSync(convertedFilePath);
                await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m });

                console.log("Archivo enviado con éxito.");

                // Eliminar los archivos después de enviarlos
                fs.unlinkSync(filePath);
                fs.unlinkSync(convertedFilePath);
            });
        } else {
            console.error("Error: El archivo no se guardó correctamente.");
            await conn.reply(m.chat, "🚩 Error: No se pudo guardar el archivo en el servidor.", m);
        }
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
