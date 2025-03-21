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
        text: `🎵 *Título:* ${video.title}
👀 Vistas: ${video.views}
⌛ Duración: ${video.timestamp}
📆 Publicado hace ${video.ago}`
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

export default handler;
