import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import yts from 'yt-search';

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (!text) return m.reply(`Ejemplo : ${usedPrefix + command} historia de anime`);
    m.react('📀');  // Reacción añadida

  try {
    let search = await yts(text);
    if (!search.all.length) return m.reply("¡No se encontraron resultados de búsqueda!");

    // Enviar mensaje de búsqueda
    m.reply("🔍 Buscando en YouTube, por favor espera...");

    const carouselCards = await Promise.all(search.all.slice(0, 5).map(async (video, index) => ({
      header: {
        title: `Resultados ${index + 1}`,
        hasMediaAttachment: true,
        imageMessage: (await generateWAMessageContent({
          image: { url: video.thumbnail }
        }, { upload: conn.waUploadToServer })).imageMessage
      },
      body: {
        text: `🎥 *${video.title}*
👁 *Vistas:* ${video.views}
⏱ *Duración:* ${video.timestamp}
📆 *Subido:* ${video.ago}
📝 *Url:* ${video.url}`
      },
      footer: {
        text: `Haga clic en el botón a continuación para ver o copiar el enlace.`
      },
      nativeFlowMessage: {
        buttons: [
          {
            "name": "cta_copy",
            "buttonParamsJson": JSON.stringify({
              "display_text": "🎵MUSICA🎵",
              "copy_code": `${usedPrefix}ytmp3 ${video.url}`
            })
          },
          {
            "name": "cta_copy",
            "buttonParamsJson": JSON.stringify({
              "display_text": "📺VIDEO📺",
              "copy_code": `${usedPrefix}ytmp4 ${video.url}`
            })
          }
        ]
      }
    })));

    // Crear y enviar mensaje tipo carrusel
    const carouselMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: {
              text: `🔎 *Resultados de búsqueda de YouTube para:* _${text}_`
            },
            footer: {
              text: `Bot de YouTube`
            },
            header: {
              hasMediaAttachment: false
            },
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: carouselCards
            })
          })
        }
      }
    }, {});

    await conn.relayMessage(m.chat, carouselMessage.message, {
      messageId: carouselMessage.key.id
    });

  } catch (e) {
    console.error("Error al procesar la búsqueda de YouTube:", e);
    await conn.sendMessage(m.chat, {
      text: "❌ Se produjo un error al realizar la búsqueda en YouTube. Inténtalo de nuevo."
    }, { quoted: m });
  }
};

handler.help = ['ytbuscar'];
handler.tags = ['buscadores'];
handler.command = /^ytbuscar|playlist|yts(earch)?$/i;
handler.limit = 1;
handler.level = 3;

async function ytmp3alt(m, { text }) {
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
        console.error("Error en ytmp3alt:", err);
        m.reply("❌ Ocurrió un error al procesar tu solicitud.");
    }
}

module.exports = { handler: ytmp3alt, command: ['ytmp3alt'] };

async function ytmp4alt(m, { text }) {
    if (!text) return m.reply("🔹 Debes proporcionar una URL de YouTube.");
    if (!text.includes("youtube.com") && !text.includes("youtu.be")) return m.reply("❌ URL no válida.");

    m.reply("⌛ Descargando video, por favor espera...");
    
    try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${text}`);
        let data = await response.json();

        if (data.status && data.data.dl) {
            let videoUrl = data.data.dl;
            conn.sendMessage(m.chat, { video: { url: videoUrl }, mimetype: 'video/mp4' }, { quoted: m });
        } else {
            m.reply("❌ No se pudo descargar el video.");
        }
    } catch (err) {
        console.error("Error en ytmp4alt:", err);
        m.reply("❌ Ocurrió un error al procesar tu solicitud.");
    }
}

module.exports = { handler: ytmp4alt, command: ['ytmp4alt'] };

export default handler;
