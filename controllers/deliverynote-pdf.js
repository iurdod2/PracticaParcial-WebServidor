// controllers/deliverynote-pdf.js
const fs = require('fs');
const path = require('path');
const { handleError } = require('../utils/handleError');
const deliveryNoteModel = require('../models/deliverynote');
const { 
    generateDeliveryNotePdf, 
    uploadPdfToIPFS, 
    getIPFSUrl 
} = require('../utils/handlePDF');
const { uploadToPinata } = require('../utils/handleUploadIPFS');

/**
 * Generar y descargar un PDF para un albarán - Sin eliminar archivo temporal
 */
const getDeliveryNotePdf = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Extraer el token de la URL
        let token;
        if (req.originalUrl && req.originalUrl.includes('?')) {
            const queryPart = req.originalUrl.split('?')[1];
            if (queryPart && queryPart.includes('.') && queryPart.split('.').length === 3) {
                token = queryPart;
            }
        }
        
        console.log('Token extraído de URL:', token ? token.substring(0, 20) + '...' : 'No presente');
        
        let userId;
        
        // Si hay un token en la URL, intenta verificarlo
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const verified = jwt.verify(token, process.env.JWT_SECRET);
                userId = verified._id;
                console.log('Usuario autenticado mediante token en URL:', userId);
            } catch (err) {
                console.error('Error al verificar token de URL:', err.message);
            }
        }
        
        // Si no tenemos userId del token en URL, intenta obtenerlo del req.user
        if (!userId && req.user && req.user._id) {
            userId = req.user._id;
            console.log('Usuario autenticado mediante req.user:', userId);
        }
        
        // Si todavía no hay userId, devolver error
        if (!userId) {
            console.error('No se pudo autenticar: ni token en URL ni usuario en sesión');
            return handleError(res, "NOT_TOKEN", 401);
        }

        // Buscar el albarán con toda la información necesaria
        console.log('Buscando albarán con ID:', id);
        const deliveryNote = await deliveryNoteModel.findOne({
            _id: id
        })
        .populate('projectId', 'name description status')
        .populate('clientId', 'name email address')
        .populate('createdBy', 'name email')
        .populate('hoursEntries.userId', 'name email');

        // Verificar que existe y que el usuario tiene acceso
        if (!deliveryNote) {
            console.error('Albarán no encontrado con ID:', id);
            return handleError(res, "DELIVERY_NOTE_NOT_FOUND", 404);
        }

        console.log('Albarán encontrado:', deliveryNote.number || 'Sin número');
        
        // Verificar que el usuario es el creador o está en la lista de invitados
        const isOwner = deliveryNote.createdBy && 
                        deliveryNote.createdBy._id && 
                        deliveryNote.createdBy._id.toString() === userId.toString();
        
        const isGuest = deliveryNote.guestAccess && 
                       Array.isArray(deliveryNote.guestAccess) &&
                       deliveryNote.guestAccess.some(guestId => 
                           guestId && guestId.toString && guestId.toString() === userId.toString()
                       );

        console.log('¿Es propietario?', isOwner);
        console.log('¿Es invitado?', isGuest);

        if (!isOwner && !isGuest) {
            console.error('Acceso denegado para el usuario:', userId);
            return handleError(res, "ACCESS_DENIED", 403);
        }

        // Crear directorio temporal si no existe
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generar nombre único para el PDF
        const pdfFileName = `deliverynote-${deliveryNote.number || id}-${Date.now()}.pdf`;
        const pdfPath = path.join(tempDir, pdfFileName);

        console.log('Generando PDF en:', pdfPath);

        // Generar el PDF
        await generateDeliveryNotePdf(deliveryNote, pdfPath);
        console.log('PDF generado correctamente en:', pdfPath);
        console.log('IMPORTANTE: No se eliminará el archivo temporal para su verificación');

        // Verificar que el archivo existe antes de enviarlo
        if (!fs.existsSync(pdfPath)) {
            console.error('No se encontró el archivo PDF generado en:', pdfPath);
            return handleError(res, "PDF_FILE_NOT_GENERATED", 500);
        }

        console.log('Preparando envío de PDF al cliente...');
        
        try {
            // Leer todo el archivo en memoria
            const fileBuffer = fs.readFileSync(pdfPath);
            
            // Configurar cabeceras específicas para forzar la descarga
            res.contentType('application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
            res.setHeader('Content-Length', fileBuffer.length);
            
            // Cabeceras para evitar caché
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            // Enviar el buffer completo como respuesta
            res.status(200).send(fileBuffer);
            
            console.log('Archivo PDF enviado al cliente correctamente');
            console.log('El archivo PDF permanece en:', pdfPath);
            
            // NO eliminamos el archivo temporal para que pueda ser verificado
            
        } catch (readErr) {
            console.error('Error al leer el archivo PDF:', readErr.message);
            handleError(res, "ERROR_READING_PDF_FILE", 500);
        }

    } catch (error) {
        console.error('Error al generar PDF del albarán:', error.message, error.stack);
        handleError(res, "ERROR_GENERATE_PDF");
    }
};

/**
 * Firmar un albarán y subir la imagen de firma a IPFS
 */
const signDeliveryNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;
        const { signedBy } = req.body;
        
        // Verificar que hay un archivo adjunto
        if (!req.file) {
            return handleError(res, "SIGNATURE_IMAGE_REQUIRED", 400);
        }

        // Buscar el albarán
        const deliveryNote = await deliveryNoteModel.findOne({
            _id: id,
            $or: [
                { createdBy: userId },
                { guestAccess: userId }
            ]
        });

        if (!deliveryNote) {
            return handleError(res, "DELIVERY_NOTE_NOT_FOUND_OR_ACCESS_DENIED", 404);
        }

        // Verificar que no esté ya firmado
        if (deliveryNote.signature && deliveryNote.signature.isSigned) {
            return handleError(res, "DELIVERY_NOTE_ALREADY_SIGNED", 400);
        }

        // Subir imagen de firma a IPFS
        const imageBuffer = req.file.buffer;
        const fileName = `signature-${deliveryNote.number}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
        
        const ipfsResponse = await uploadToPinata(imageBuffer, fileName);
        
        if (!ipfsResponse || !ipfsResponse.IpfsHash) {
            return handleError(res, "ERROR_UPLOADING_TO_IPFS", 500);
        }

        // Construir URL para la imagen
        const imageUrl = getIPFSUrl(ipfsResponse.IpfsHash);

        // Actualizar el albarán con la firma
        const updatedDeliveryNote = await deliveryNoteModel.findByIdAndUpdate(
            id,
            {
                'signature.isSigned': true,
                'signature.date': new Date(),
                'signature.signedBy': signedBy || req.user.name || userId,
                'signature.ipfsHash': ipfsResponse.IpfsHash,
                'signature.imageUrl': imageUrl
            },
            { new: true }
        );

        // Generar y subir el PDF a IPFS
        try {
            // Buscar albarán con datos populados para generar el PDF
            const populatedDeliveryNote = await deliveryNoteModel.findById(id)
                .populate('projectId', 'name description status')
                .populate('clientId', 'name email address')
                .populate('createdBy', 'name email')
                .populate('hoursEntries.userId', 'name email');

            // Crear directorio temporal si no existe
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Generar PDF
            const pdfFileName = `deliverynote-${deliveryNote.number}-${Date.now()}.pdf`;
            const pdfPath = path.join(tempDir, pdfFileName);
            
            await generateDeliveryNotePdf(populatedDeliveryNote, pdfPath);
            
            // Subir a IPFS
            const pdfIpfsResponse = await uploadPdfToIPFS(pdfPath, pdfFileName);
            
            if (pdfIpfsResponse && pdfIpfsResponse.IpfsHash) {
                const pdfUrl = getIPFSUrl(pdfIpfsResponse.IpfsHash);
                
                await deliveryNoteModel.findByIdAndUpdate(id, {
                    'pdf.ipfsHash': pdfIpfsResponse.IpfsHash,
                    'pdf.url': pdfUrl,
                    'pdf.generatedAt': new Date()
                });
            }
            
            // Eliminar archivo temporal
            fs.unlink(pdfPath, (err) => {
                if (err) console.error('Error al eliminar archivo PDF temporal:', err);
            });
            
        } catch (pdfError) {
            console.error('Error al generar/subir PDF firmado:', pdfError);
            // Continuar aunque falle la subida del PDF
        }

        res.send({ 
            data: updatedDeliveryNote,
            message: "DELIVERY_NOTE_SIGNED_SUCCESSFULLY" 
        });
        
    } catch (error) {
        console.error('Error al firmar albarán:', error.message);
        handleError(res, "ERROR_SIGNING_DELIVERY_NOTE");
    }
};

/**
 * Añadir un usuario invitado para acceder al albarán
 */
const addGuestAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;
        const { guestId } = req.body;

        // Verificar que el albarán exista y pertenezca al usuario
        const deliveryNote = await deliveryNoteModel.findOne({ 
            _id: id, 
            createdBy: userId 
        });
        
        if (!deliveryNote) {
            return handleError(res, "DELIVERY_NOTE_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        // Añadir el invitado si no está ya en la lista
        if (!deliveryNote.guestAccess.includes(guestId)) {
            const updatedDeliveryNote = await deliveryNoteModel.findByIdAndUpdate(
                id,
                { $addToSet: { guestAccess: guestId } },
                { new: true }
            );
            
            res.send({ 
                data: updatedDeliveryNote,
                message: "GUEST_ACCESS_ADDED" 
            });
        } else {
            res.send({ 
                data: deliveryNote,
                message: "GUEST_ALREADY_HAS_ACCESS" 
            });
        }
        
    } catch (error) {
        console.error('Error al añadir acceso de invitado:', error.message);
        handleError(res, "ERROR_ADDING_GUEST_ACCESS");
    }
};

/**
 * Eliminar un albarán (solo si no está firmado)
 */
const safeDeleteDeliveryNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        // Buscar el albarán
        const deliveryNote = await deliveryNoteModel.findOne({
            _id: id,
            createdBy: userId
        });

        if (!deliveryNote) {
            return handleError(res, "DELIVERY_NOTE_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        // Verificar que no esté firmado
        if (deliveryNote.signature && deliveryNote.signature.isSigned) {
            return handleError(res, "CANNOT_DELETE_SIGNED_DELIVERY_NOTE", 400);
        }

        // Eliminar el albarán
        await deliveryNoteModel.findByIdAndDelete(id);

        res.send({ message: "DELIVERY_NOTE_DELETED" });
    } catch (error) {
        console.error('Error al eliminar albarán:', error.message);
        handleError(res, "ERROR_DELETE_DELIVERY_NOTE");
    }
};

module.exports = {
    getDeliveryNotePdf,
    signDeliveryNote,
    addGuestAccess,
    safeDeleteDeliveryNote
};