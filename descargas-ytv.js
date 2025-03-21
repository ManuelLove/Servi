import fetch from 'node-fetch'

var handler = async (m, { conn, args, usedPrefix, command }) => {

if (!args[0]) return conn.reply(m.chat, `🎌 *Ingrese un enlace de YouTube*

Ejemplo, !${command} https://youtu.be/85xI8WFMIUY`, m)

await conn.reply(m.chat, `⏰ Espere un momento`, m)

try {
    let apiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${args[0]}`;
    let response = await fetch(apiUrl);
    let data = await response.json();

    if (data.status && data.data.dl) {
        let videoUrl = data.data.dl;
        let titulo = data.data.title || 'video';

        await conn.sendMessage(m.chat, { video: { url: videoUrl }, fileName: `${titulo}.mp4`, mimetype: 'video/mp4', caption: `*Título*
${titulo}` }, { quoted: m });
    } else {
        await conn.reply(m.chat, '🚩 *Error al descargar el video*', m);
    }
} catch (error) {
    console.error("Error en la descarga de video:", error);
    await conn.reply(m.chat, `🚩 *Ocurrió un error al descargar el video*`, m);
}}

handler.help = ['ytv']
handler.tags = ['descargas']
handler.command = /^fgmp4|dlmp4|getvid|yt(v|mp4)?$/i
handler.register = true;
handler.limit = 1;
handler.level = 3;
export default handler
