import fetch from 'node-fetch'

var handler = async (m, { text, conn, args, usedPrefix, command }) => {

if (!args[0]) return conn.reply(m.chat, '🎌 *Ingrese el comando más un enlace de YouTube*', m)

let youtubeLink = args[0]

await conn.reply(m.chat, `⏰ Espere un momento`, m)

try {
    let apiUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${youtubeLink}`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    let audioUrl = data.result.url;
    
    await conn.sendFile(m.chat, audioUrl, data.result.title + '.mp3', null, m, false, { mimetype: 'audio/mp4' });
} catch (error) {
    await conn.reply(m.chat, '🚩 *Ocurrió un fallo al descargar el audio*', m);
}}

handler.help = ['yta']
handler.tags = ['descargas']
handler.command = /^audio|fgmp3|dlmp3|getaud|yt(a|mp3)$/i

handler.register = true
handler.limit = true

export default handler
