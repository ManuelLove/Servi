const axios = require('axios');

async function ytmp3(url) {
    try {
        const response = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${url}`);
        if (response.data.status && response.data.data.dl) {
            return {
                title: response.data.data.title,
                audio: response.data.data.dl,
                size: response.data.data.size,
                thumbnail: response.data.data.thumbnail
            };
        } else {
            throw new Error('Error al obtener el audio.');
        }
    } catch (error) {
        console.error('Error en ytmp3:', error.message);
        throw error;
    }
}

async function ytmp4(url) {
    try {
        const response = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`);
        if (response.data.status && response.data.data.dl) {
            return {
                title: response.data.data.title,
                video: response.data.data.dl,
                size: response.data.data.size,
                thumbnail: response.data.data.thumbnail
            };
        } else {
            throw new Error('Error al obtener el video.');
        }
    } catch (error) {
        console.error('Error en ytmp4:', error.message);
        throw error;
    }
}

module.exports = { ytmp3, ytmp4 };
