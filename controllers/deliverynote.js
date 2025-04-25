// controllers/deliverynote.js
const { handleError } = require('../utils/handleError');
const deliveryNoteModel = require('../models/deliverynote');
const projectsModel = require('../models/projects');
const clientsModel = require('../models/clients');

/**
 * Crear un nuevo albarán (asociado a un proyecto y usuario)
 */
const createDeliveryNote = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { projectId, hoursEntries, materialEntries } = req.body;

        // Verificar que el proyecto existe y pertenece al usuario
        const project = await projectsModel.findOne({ 
            _id: projectId, 
            createdBy: userId 
        });
        
        if (!project) {
            return handleError(res, "PROJECT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        // Obtener el cliente del proyecto para asociarlo al albarán
        const clientId = project.clientId;
        
        // Generar número secuencial para el albarán (ejemplo: ALB-2025-0001)
        const year = new Date().getFullYear();
        const count = await deliveryNoteModel.countDocuments();
        const number = `ALB-${year}-${(count + 1).toString().padStart(4, '0')}`;
        
        // Determinar si es un albarán simple o múltiple
        const isSimple = (!hoursEntries || hoursEntries.length <= 1) && 
                         (!materialEntries || materialEntries.length <= 1);
        
        // Crear el albarán
        const deliveryNote = await deliveryNoteModel.create({
            ...req.body,
            clientId,
            number,
            isSimple,
            createdBy: userId
        });

        res.send({ data: deliveryNote });
    } catch (error) {
        console.error('Error al crear albarán:', error.message);
        handleError(res, "ERROR_CREATE_DELIVERY_NOTE");
    }
};

/**
 * Obtener todos los albaranes del usuario actual
 */
const getDeliveryNotes = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { projectId, clientId, status } = req.query;
        
        const filter = { 
            createdBy: userId
        };
        
        // Filtrar por proyecto si se proporciona projectId
        if (projectId) {
            filter.projectId = projectId;
        }
        
        // Filtrar por cliente si se proporciona clientId
        if (clientId) {
            filter.clientId = clientId;
        }
        
        // Filtrar por estado si se proporciona status
        if (status) {
            filter.status = status;
        }
        
        const deliveryNotes = await deliveryNoteModel.find(filter)
            .populate('projectId', 'name')
            .populate('clientId', 'name');
            
        res.send({ data: deliveryNotes });
    } catch (error) {
        console.error('Error al obtener albaranes:', error.message);
        handleError(res, "ERROR_GET_DELIVERY_NOTES");
    }
};

/**
 * Obtener un albarán específico (con datos expandidos)
 */
const getDeliveryNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const deliveryNote = await deliveryNoteModel.findOne({
            _id: id,
            createdBy: userId
        })
        .populate('projectId', 'name description status')
        .populate('clientId', 'name email address')
        .populate('createdBy', 'name email')
        .populate('hoursEntries.userId', 'name email');

        if (!deliveryNote) {
            return handleError(res, "DELIVERY_NOTE_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ data: deliveryNote });
    } catch (error) {
        console.error('Error al obtener albarán:', error.message);
        handleError(res, "ERROR_GET_DELIVERY_NOTE");
    }
};

/**
 * Actualizar un albarán (solo si pertenece al usuario)
 */
const updateDeliveryNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;
        const { projectId, hoursEntries, materialEntries } = req.body;

        // 1. Verificar que el albarán exista y pertenezca al usuario
        const deliveryNote = await deliveryNoteModel.findOne({ 
            _id: id, 
            createdBy: userId 
        });
        
        if (!deliveryNote) {
            return handleError(res, "DELIVERY_NOTE_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        // 2. Si cambia el proyecto, verificar que el nuevo proyecto exista y pertenezca al usuario
        if (projectId && projectId !== deliveryNote.projectId.toString()) {
            const project = await projectsModel.findOne({ 
                _id: projectId, 
                createdBy: userId 
            });
            
            if (!project) {
                return handleError(res, "PROJECT_NOT_FOUND_OR_NOT_OWNER", 404);
            }
            
            // Actualizar el clientId si cambia el proyecto
            req.body.clientId = project.clientId;
        }

        // 3. Determinar si es un albarán simple o múltiple
        if (hoursEntries || materialEntries) {
            const updatedHoursEntries = hoursEntries || deliveryNote.hoursEntries;
            const updatedMaterialEntries = materialEntries || deliveryNote.materialEntries;
            
            const isSimple = (updatedHoursEntries.length <= 1) && (updatedMaterialEntries.length <= 1);
            req.body.isSimple = isSimple;
        }

        // 4. Actualizar
        const updatedDeliveryNote = await deliveryNoteModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.send({ data: updatedDeliveryNote });
    } catch (error) {
        console.error('Error al actualizar albarán:', error.message);
        handleError(res, "ERROR_UPDATE_DELIVERY_NOTE");
    }
};

/**
 * Eliminar un albarán
 */
const deleteDeliveryNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const deliveryNote = await deliveryNoteModel.findOneAndDelete({
            _id: id,
            createdBy: userId
        });

        if (!deliveryNote) {
            return handleError(res, "DELIVERY_NOTE_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ message: "DELIVERY_NOTE_DELETED" });
    } catch (error) {
        console.error('Error al eliminar albarán:', error.message);
        handleError(res, "ERROR_DELETE_DELIVERY_NOTE");
    }
};

/**
 * Cambiar el estado de un albarán
 */
const changeDeliveryNoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;
        const { status } = req.body;

        const deliveryNote = await deliveryNoteModel.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { status },
            { new: true }
        );

        if (!deliveryNote) {
            return handleError(res, "DELIVERY_NOTE_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ data: deliveryNote });
    } catch (error) {
        console.error('Error al cambiar estado del albarán:', error.message);
        handleError(res, "ERROR_CHANGE_DELIVERY_NOTE_STATUS");
    }
};

module.exports = {
    createDeliveryNote,
    getDeliveryNotes,
    getDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    changeDeliveryNoteStatus
};