const { handleError } = require('../utils/handleError');
const clientsModel = require('../models/clients');

/**
 * Crear un nuevo cliente (asociado al usuario actual)
 */
const createClient = async (req, res) => {
    try {
        const { _id: userId } = req.user;

        // Verificar si el email ya está registrado (único global)
        const existingClient = await clientsModel.findOne({ email: req.body.email });
        if (existingClient) {
            return handleError(res, "CLIENT_ALREADY_EXISTS", 409);
        }

        const client = await clientsModel.create({
            ...req.body,
            createdBy: userId
        });

        res.send({ data: client });
    } catch (error) {
        console.error('Error al crear cliente:', error.message);
        handleError(res, "ERROR_CREATE_CLIENT");
    }
};

/**
 * Actualizar un cliente (solo si pertenece al usuario)
 */
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        // 1. Verificar que el cliente exista y pertenezca al usuario
        const client = await clientsModel.findOne({ _id: id, createdBy: userId });
        if (!client) {
            return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        // 2. Si se cambia el email, verificar que no esté en uso
        if (req.body.email && req.body.email !== client.email) {
            const emailExists = await clientsModel.findOne({ 
                email: req.body.email,
                _id: { $ne: id }  // Excluir el cliente actual
            });
            if (emailExists) {
                return handleError(res, "EMAIL_ALREADY_IN_USE", 409);
            }
        }

        // 3. Actualizar
        const updatedClient = await clientsModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.send({ data: updatedClient });
    } catch (error) {
        console.error('Error al actualizar cliente:', error.message);
        handleError(res, "ERROR_UPDATE_CLIENT");
    }
};

/**
 * Obtener todos los clientes del usuario actual (no archivados)
 */
const getClients = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const clients = await clientsModel.find({ 
            createdBy: userId,
            isArchived: false
        });
        res.send({ data: clients });
    } catch (error) {
        console.error('Error al obtener clientes:', error.message);
        handleError(res, "ERROR_GET_CLIENTS");
    }
};

/**
 * Obtener un cliente específico (solo si pertenece al usuario)
 */
const getClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const client = await clientsModel.findOne({
            _id: id,
            createdBy: userId
        });

        if (!client) {
            return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ data: client });
    } catch (error) {
        console.error('Error al obtener cliente:', error.message);
        handleError(res, "ERROR_GET_CLIENT");
    }
};

/**
 * Archivar cliente (soft delete)
 */
const archiveClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const client = await clientsModel.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { isArchived: true },
            { new: true }
        );

        if (!client) {
            return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ data: client });
    } catch (error) {
        console.error('Error al archivar cliente:', error.message);
        handleError(res, "ERROR_ARCHIVE_CLIENT");
    }
};

/**
 * Eliminar cliente permanentemente (hard delete)
 */
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const client = await clientsModel.findOneAndDelete({
            _id: id,
            createdBy: userId
        });

        if (!client) {
            return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ message: "CLIENT_DELETED" });
    } catch (error) {
        console.error('Error al eliminar cliente:', error.message);
        handleError(res, "ERROR_DELETE_CLIENT");
    }
};

/**
 * Obtener clientes archivados del usuario
 */
const getArchivedClients = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const clients = await clientsModel.find({ 
            createdBy: userId,
            isArchived: true
        });
        res.send({ data: clients });
    } catch (error) {
        console.error('Error al obtener archivados:', error.message);
        handleError(res, "ERROR_GET_ARCHIVED_CLIENTS");
    }
};

/**
 * Restaurar cliente archivado
 */
const restoreClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const client = await clientsModel.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { isArchived: false },
            { new: true }
        );

        if (!client) {
            return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ data: client });
    } catch (error) {
        console.error('Error al restaurar cliente:', error.message);
        handleError(res, "ERROR_RESTORE_CLIENT");
    }
};

module.exports = {
    createClient,
    updateClient,
    getClients,
    getClient,
    archiveClient,
    deleteClient,
    getArchivedClients,
    restoreClient
};