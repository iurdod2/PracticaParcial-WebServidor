const { StorageModel } = require('../models/index');
const path = require('path');

/**
 * Función para crear un nuevo elemento de almacenamiento
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const createItem = async (req, res) => {
    // Mostrar información de depuración
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    // Verificar si se ha subido un archivo
    if (!req.file) {
        return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    // Crear un nuevo registro en la base de datos
    const data = await StorageModel.create({
        fileName: req.file.originalname,
        fileURL: `/storage/${req.file.filename}` // Ruta de almacenamiento
    });

    // Devolver los datos del archivo creado
    res.json({ data });
};

/**
 * Función para actualizar el logo
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const updateLogo = async (req, res) => {
    try {
        // Verificar si se ha subido un archivo
        if (!req.file) {
            return res.status(400).send('ERROR_NO_SE_HA_SUBIDO_ARCHIVO');
        }

        // Construir la ruta de acceso al archivo
        const fileURL = `/storage/${req.file.filename}`; // Ruta local

        // Buscar si ya existe un logo en la base de datos
        const existingLogo = await StorageModel.findOne();

        if (existingLogo) {
            // Si ya existe un logo, actualizarlo
            const updatedLogo = await StorageModel.findByIdAndUpdate(
                existingLogo._id, 
                {
                    fileName: req.file.originalname,
                    fileURL
                }, 
                { new: true } // Devuelve el documento actualizado
            );

            return res.status(200).json({
                success: true,
                message: 'Logo actualizado correctamente',
                data: updatedLogo
            });
        } else {
            // Si no existe, crear un nuevo registro de logo
            const newLogo = await StorageModel.create({
                fileName: req.file.originalname,
                fileURL
            });

            return res.status(201).json({
                success: true,
                message: 'Logo creado correctamente',
                data: newLogo
            });
        }
    } catch (error) {
        console.error('Error al actualizar el logo:', error);
        res.status(500).send('ERROR_AL_SUBIR_LOGO');
    }
};

module.exports = { createItem, updateLogo };