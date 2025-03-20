import fetch from 'node-fetch';
import yts from 'yt-search';

const LimitAud = 725 * 1024 * 1024; // 725MB
const LimitVid = 425 * 1024 * 1024; // 425MB
let tempStorage = {};

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `❌ Uso incorrecto. Ejemplo:\n${usedPrefix + command} Billie Eilish - Bellyache`, m);
  
  const yt_play = await search(args.join(' '));
  if (!yt_play.length) return conn.reply(m.chat, '❌ No se encontraron resultados.', m);

  const videoData = yt_play[0];
  tempStorage[m.sender] = { url: videoData.url, title: videoData.title };

  const message = `🎶 *${videoData.title}*\n📅 ${videoData.ago}\n⏳ ${secondString(videoData.duration.seconds)}\n👀 ${MilesNumber(videoData.views)}\n👤 ${videoData.author.name}\n🔗 ${videoData.url}`;

  await conn.sendMessage(m.chat, {
    image: { url: videoData.thumbnail },
    caption: message,
    footer: 'Seleccione una opción:',
    buttons: [
      { buttonId: `.ytmp3 ${videoData.url}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
      { buttonId: `.ytmp4 ${videoData.url}`, buttonText: { displayText: "🎥 Video" }, type: 1 }
    ],
    viewOnce: true
  }, { quoted: m });
};

handler.before = async (m, { conn }) => {
  const text = m.text.trim().toLowerCase();
  if (!['🎶', 'audio', '📽', 'video'].includes(text)) return;

  const userVideoData = tempStorage[m.sender];
  if (!userVideoData || !userVideoData.url) return;

  const isAudio = text === '🎶' || text === 'audio';
  const apiUrl = isAudio
    ? `https://api.siputzx.my.id/api/d/ytmp3?url=${userVideoData.url}`
    : `https://api.siputzx.my.id/api/d/ytmp4?url=${userVideoData.url}`;

  try {
    await conn.reply(m.chat, `⏳ Descargando ${isAudio ? "audio" : "video"}...`, m);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (!data.status || !data.data || !data.data.dl) throw new Error('No se pudo obtener el enlace de descarga.');

    const mediaUrl = data.data.dl;
    const fileSize = await getFileSize(mediaUrl);

    if (fileSize === 0) throw new Error('Error al obtener el tamaño del archivo.');

    const isLargeFile = isAudio ? fileSize > LimitAud : fileSize > LimitVid;
    const sendAsDocument = isLargeFile ? { document: { url: mediaUrl }, mimetype: isAudio ? 'audio/mpeg' : 'video/mp4', fileName: `${userVideoData.title}.${isAudio ? 'mp3' : 'mp4'}` }
                                       : { [isAudio ? 'audio' : 'video']: { url: mediaUrl }, mimetype: isAudio ? 'audio/mpeg' : 'video/mp4' };

    await conn.sendMessage(m.chat, sendAsDocument, { quoted: m });
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, `❌ Error: ${error.message}`, m);
  } finally {
    delete tempStorage[m.sender];
  }
};

handler.command = /^(play|play2)$/i;
handler.register = true;
export default handler;

async function search(query) {
  const search = await yts.search({ query, hl: 'es', gl: 'ES' });
  return search.videos;
}

function MilesNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function secondString(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${d ? `${d}d ` : ''}${h ? `${h}h ` : ''}${m ? `${m}m ` : ''}${s ? `${s}s` : ''}`.trim();
}

async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return parseInt(response.headers.get('content-length') || '0');
  } catch {
    return 0;
  }
}