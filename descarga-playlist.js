import yts from 'yt-search';
let handler = async (m, { conn, usedPrefix, text, args, command }) => {
if (!text) return conn.reply(m.chat, `${lenguajeGB['smsAvisoMG']()}𝙀𝙎𝘾𝙍𝙄𝘽𝘼 𝙀𝙇 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀 𝙐𝙉 𝙑𝙄𝘿𝙀𝙊 𝙊 𝘾𝘼𝙉𝘼𝙇 𝘿𝙀 𝙔𝙊𝙐𝙏𝙐𝘽𝙀\n\n𝙒𝙍𝙄𝙏𝙀 𝙏𝙃𝙀 𝙉𝘼𝙈𝙀 𝙊𝙁 𝘼 𝙔𝙊𝙐𝙏𝙐𝘽𝙀 𝙑𝙄𝘿𝙀𝙊 𝙊𝙍 𝘾𝙃𝘼𝙉𝙉𝙀𝙇`, fkontak,  m)
try {
    let result = await yts(text);
    let ytres = result.videos;
  updatePopularCommand(command); // Mencatat command
  if (!text) return m.reply(`Ejemplo : ${prefix + command} historia de anime`);
  if (!firely(m, '⏳ Tratamiento..')) return; // Jika limit habis, proses berhenti di sini

  try {
    // Cari hasil di YouTube menggunakan API
    let search = await yts(text);
    if (!search.all.length) return m.reply("¡No se encontraron resultados de búsqueda!");

    // Enviar un mensaje de depuración antes de procesar la respuesta
    m.reply("🔍 Buscando en YouTube, por favor espera...");

    // Batasi hasil pencarian ke 5 item teratas dan siapkan carousel card
    const carouselCards = await Promise.all(search.all.slice(0, 5).map(async (video, index) => ({
      header: {
        title: `Resultados ${index + 1}`,
        hasMediaAttachment: true,
        imageMessage: (await generateWAMessageContent({
          image: { url: video.thumbnail }
        }, { upload: conn.waUploadToServer })).imageMessage
      },
      body: {
        text: `🎥 *${video.title}*\n👁 *Vistas:* ${video.views}\n⏱ *Duración:* ${video.timestamp}\n📆 *Subido:* ${video.ago}\n📝 *Url:* ${video.url}`
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
            "copy_code": `${prefix}ytmp3 ${video.url}`
            })
          },
          {
            "name": "cta_copy",
            "buttonParamsJson": JSON.stringify({
            "display_text": "📺VIDEO📺",
            "copy_code": `${prefix}ytmp4 ${video.url}`
            })
          }
        ]
      }
    })));

    // Buat pesan carousel
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
              text: `Bot de YouTube de Techfix Solutions`
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

    // Kirim pesan carousel
    await conn.relayMessage(m.chat, carouselMessage.message, {
      messageId: carouselMessage.key.id
    });

  } catch (e) {
    console.error("Error al procesar la solicitud de búsqueda de YouTube:", e);
    await conn.sendMessage(m.chat, {
      text: "❌ Se produjo un error al procesar una búsqueda en YouTube. Por favor inténtalo de nuevo."
    }, { quoted: m });
  }
}
break;
console.log(e) 
}}
handler.help = ['playlist']
handler.tags = ['dl']
handler.command = /^playlist|ytbuscar|yts(earch)?$/i
handler.limit = 1
handler.level = 3
export default handler
