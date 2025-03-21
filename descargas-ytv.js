import fetch from 'node-fetch'

var handler = async (m, { conn, args, usedPrefix, command }) => {

if (!args[0]) return conn.reply(m.chat, `🎌 *Ingrese un enlace de YouTube*

Ejemplo, !${command} https://youtu.be/85xI8WFMIUY`, m)

await conn.reply(m.chat, `⏰ Espere un momento`, m)

try {
    let apiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${args[0]}`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    let videoUrl = data.result.url;

    await conn.sendMessage(m.chat, { video: { url: videoUrl }, fileName: `${data.result.title}.mp4`, mimetype: 'video/mp4', caption: `*Título*
${data.result.title}` }, { quoted: m });
} catch (error) {
    await conn.reply(m.chat, `🚩 *Ocurrió un error al descargar el video*`, m);
}}

handler.help = ['ytv']
handler.tags = ['descargas']
handler.command = /^fgmp4|dlmp4|getvid|yt(v|mp4)?$/i

handler.register = true
handler.limit = true

export default handler
