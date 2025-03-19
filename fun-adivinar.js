import fs from 'fs';
import similarity from 'similarity';

let timeout = 60000;  //60s
let timeout2 = 20000; //20s
let poin = 500;
const threshold = 0.72;
let juegos = {};

const archivosRespaldo = {
    acertijo: "acertijo.json",
    pelicula: "peliculas.json",
    trivia: "trivia.json"
};

async function obtenerPregunta(tipo) {
    try {
        let archivo = `./src/game/${archivosRespaldo[tipo]}`;
        let data = JSON.parse(fs.readFileSync(archivo));

        let preguntaNueva;
        let intentos = 10; // Evita repetir la última pregunta hasta 10 intentos

        do {
            preguntaNueva = data[Math.floor(Math.random() * data.length)];
            intentos--;
        } while (juegos.ultimaPregunta === preguntaNueva.question && intentos > 0);

        juegos.ultimaPregunta = preguntaNueva.question; // Guarda la última pregunta usada
        return preguntaNueva;
    } catch (error) {
        console.error(`Error al leer el archivo ${archivo}:`, error);
        return null;
    }
}

let handler = async (m, { conn, command }) => {
    let id = m.chat;
    if (juegos[id]) return conn.reply(m.chat, '❌️ Todavía hay un juego sin responder en este chat', m);
    try {
        let tipo = "";
        if (/^(acertijo|acert|adivinanza|tekateki)$/i.test(command)) tipo = "acertijo";
        else if (/^(advpe|adv|peliculas|pelicula)$/i.test(command)) tipo = "pelicula";
        else if (/^(trivia|triviador)$/i.test(command)) tipo = "trivia";
        if (!tipo) return;

        let pregunta = await obtenerPregunta(tipo);
        if (!pregunta) return;

        let caption = "";
        if (tipo === "acertijo") {      
            caption = `${pregunta.question}\n\n*• Tiempo:* ${(timeout / 1000)}s\n*• Bono:* +${poin} XP`;
        } else if (tipo === "pelicula") {
            let clue = pregunta.response.replace(/[A-Za-z]/g, '_');
            caption = `${pregunta.question}\n\n*Pista:* ${clue}\n\n*• Tiempo:* ${(timeout / 1000)}s\n*• Bono:* +${poin} XP`;
        } else if (tipo === "trivia") {
            caption = `${pregunta.question}\n\n*• Tiempo:* ${(timeout2 / 1000)}s\n*• Bono:* +${poin} XP\n\n💫 Responde a este mensaje con la letra de la opción correcta ✅`;
        }

        let enviado = await conn.reply(m.chat, caption, m);
        juegos[id] = {
            tipo,
            pregunta,
            caption: enviado,
            puntos: poin,
            timeout: setTimeout(() => {
                if (juegos[id]) {
                    conn.reply(m.chat, `⏳ ¡Tiempo agotado! La respuesta era: *${pregunta.response}*`, enviado);
                    delete juegos[id];
                }
            }, tipo === "trivia" ? timeout2 : timeout)
        };
    } catch (e) {
        console.error(e);
    }
};

handler.before = async (m) => {
    let id = m.chat;
    if (!juegos[id] || !m.quoted || !m.quoted.fromMe || !m.quoted.id) return;
    let juego = juegos[id];
    if (m.quoted.id !== juego.caption.key.id) return;

    let respuestaCorrecta = juego.pregunta.response.toLowerCase().trim();
    let respuestaUsuario = m.text.toLowerCase().trim();
    if (respuestaUsuario === respuestaCorrecta) {
        global.db.data.users[m.sender].exp += juego.puntos;
        m.reply(`✅ *¡Correcto!*\nGanaste +${juego.puntos} XP`);
        clearTimeout(juego.timeout);
        delete juegos[id];
    } else if (similarity(respuestaUsuario, respuestaCorrecta) >= threshold) {
        m.reply(`🔥 *Casi!* La respuesta es muy parecida.`);
    } else {
        m.reply(`❌ *Incorrecto!* Intenta de nuevo.`);
    }
};

handler.help = ['acertijo', 'pelicula', 'trivia'];
handler.tags = ['game'];
handler.command = /^(acertijo|acert|adivinanza|tekateki|advpe|adv|peliculas|pelicula|trivia|triviador)$/i;
handler.register = true;

export default handler;