// utils/handleUploadIPFS.js
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

/**
 * Sube un archivo a IPFS mediante Pinata
 * @param {Buffer} fileBuffer - Buffer del archivo a subir
 * @param {String} fileName - Nombre del archivo
 * @returns {Promise<Object>} - Respuesta de Pinata con el hash IPFS
 */
const uploadToPinata = async (fileBuffer, fileName) => {
    try {
        const pinataApiKey = process.env.PINATA_API_KEY;
        const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
        const pinataURL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        
        // Crear un objeto FormData de Node.js (no del navegador)
        const formData = new FormData();
        
        // Añadir el archivo como buffer
        formData.append('file', fileBuffer, {
            filename: fileName,
            contentType: 'application/octet-stream',
        });
        
        // Añadir los metadatos
        formData.append('pinataMetadata', JSON.stringify({
            name: fileName
        }));
        
        // Añadir las opciones
        formData.append('pinataOptions', JSON.stringify({
            cidVersion: 1
        }));
        
        // Realizar la petición a Pinata
        const response = await axios.post(pinataURL, formData, {
            headers: {
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey,
                ...formData.getHeaders() // Importante para que funcione con FormData
            },
            maxContentLength: Infinity, // Para permitir archivos grandes
            maxBodyLength: Infinity
        });
        
        // Retornar los datos de la respuesta
        return response.data;
        
    } catch (error) {
        console.error('Error al subir archivo a IPFS:', error.message);
        
        // Mejorar el mensaje de error para incluir detalles si están disponibles
        if (error.response && error.response.data) {
            console.error('Detalles del error de Pinata:', error.response.data);
            throw new Error(`Error en la respuesta de Pinata: ${JSON.stringify(error.response.data)}`);
        }
        
        throw new Error(`Error al subir archivo a IPFS: ${error.message}`);
    }
};

module.exports = { uploadToPinata };