const { StorageModel } = require('../models/index');
const path = require('path');

const createItem = async (req, res) => {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    if (!req.file) {
        return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const data = await StorageModel.create({
        fileName: req.file.originalname,
        fileURL: `/storage/${req.file.filename}` // Ruta de almacenamiento
    });

    res.json({ data });
};


const updateLogo = async (req, res) => {
    try {
        // Verificar si se ha subido un archivo
        if (!req.file) {
            return res.status(400).send('ERROR_NO_FILE_UPLOADED');
        }

        const fileURL = `/storage/${req.file.filename}`; // Ruta local

        // Buscar el primer logo existente
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
                message: 'Logo updated successfully',
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
                message: 'Logo created successfully',
                data: newLogo
            });
        }
    } catch (error) {
        console.error('Error updating logo:', error);
        res.status(500).send('ERROR_UPLOAD_LOGO');
    }
};

module.exports = { createItem, updateLogo };
