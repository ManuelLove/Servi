let ro = 3000;
let handler = async (m, { conn, usedPrefix, command }) => {
    let time = global.db.data.users[m.sender].lastrob + 7200000;
    if (new Date - global.db.data.users[m.sender].lastrob < 7200000) 
        throw `*⏱️¡Hey! Espera ${msToTime(time - new Date())} para volver a robar*`;

    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    
    if (!who) throw `🔔 *Etiqueta a alguien para robar.*`;
    if (!(who in global.db.data.users)) throw `⚠️ *El usuario no está en mi base de datos.*`;

    let user = global.db.data.users[m.sender];
    let target = global.db.data.users[who];

    // Probabilidad del 15% de activar la "Corrupción Venezolana"
    if (Math.random() < 0.50) {
        user.exp -= 2000;
        user.diamond = Math.max(0, user.diamond - 5);
        user.money = Math.max(0, user.money - 100);
        
        return m.reply(
            `*_CORRUPCIÓN VENEZOLANA!_* 🥷🥷🥷\n\n` +
            `*¡LA CORRUPCIÓN VENEZOLANA TE HA ALCANZADO! )':*\n\n` +
            `*HAZ PERDIDO:*\n` +
            `*- 2000 XP*\n` +
            `*- 5 Diamantes 💎*\n` +
            `*- 100 Monedas 🪙*\n\n` +
            `*_¡AHORA SE HA VUELTO CORRUPTO!_* 🥷`
        );
    }

    // Robo normal si no se activa la penitencia
    let rob = Math.floor(Math.random() * ro);
    if (target.exp < rob) return m.reply(`😿 @${who.split`@`[0]} tiene menos de *${ro} XP* No robes a un pobre :v`, null, { mentions: [who] });

    user.exp += rob;
    target.exp -= rob;
    user.money += rob;
    target.money -= rob;

    m.reply(`*✧ Robaste ${rob} XP a @${who.split`@`[0]}*`, null, { mentions: [who] });

    user.lastrob = new Date * 1;
};

handler.help = ['rob'];
handler.tags = ['econ'];
handler.command = ['robar', 'rob'];
handler.group = true;
handler.register = true;
export default handler;

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " Hora(s) " + minutes + " Minuto(s)";
}