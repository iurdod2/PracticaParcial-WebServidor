// controllers/projects.js
const { handleError } = require('../utils/handleError');
const projectsModel = require('../models/projects');
const clientsModel = require('../models/clients');

/**
 * Crear un nuevo proyecto (asociado al usuario actual y a un cliente)
 */
const createProject = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { clientId } = req.body;

        // Verificar que el cliente existe y pertenece al usuario
        const client = await clientsModel.findOne({ 
            _id: clientId, 
            createdBy: userId 
        });
        
        if (!client) {
            return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        // Verificar si ya existe un proyecto con este nombre para este usuario/cliente
        const existingProject = await projectsModel.findOne({ 
            name: req.body.name,
            clientId: clientId,
            createdBy: userId
        });

        if (existingProject) {
            return handleError(res, "PROJECT_NAME_ALREADY_EXISTS", 409);
        }

        const project = await projectsModel.create({
            ...req.body,
            createdBy: userId
        });

        res.send({ data: project });
    } catch (error) {
        console.error('Error al crear proyecto:', error.message);
        handleError(res, "ERROR_CREATE_PROJECT");
    }
};

/**
 * Actualizar un proyecto (solo si pertenece al usuario)
 */
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;
        const { clientId, name } = req.body;

        // 1. Verificar que el proyecto exista y pertenezca al usuario
        const project = await projectsModel.findOne({ _id: id, createdBy: userId });
        if (!project) {
            return handleError(res, "PROJECT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        // 2. Si cambia el cliente, verificar que el nuevo cliente exista y pertenezca al usuario
        if (clientId && clientId !== project.clientId.toString()) {
            const client = await clientsModel.findOne({ 
                _id: clientId, 
                createdBy: userId 
            });
            
            if (!client) {
                return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
            }
        }

        // 3. Si cambia el nombre, verificar que no haya otro proyecto con ese nombre para el mismo cliente
        if (name && name !== project.name) {
            const clientIdToCheck = clientId || project.clientId;
            const existingProject = await projectsModel.findOne({ 
                name: name,
                clientId: clientIdToCheck,
                createdBy: userId,
                _id: { $ne: id }  // Excluir el proyecto actual
            });

            if (existingProject) {
                return handleError(res, "PROJECT_NAME_ALREADY_EXISTS", 409);
            }
        }

        // 4. Actualizar
        const updatedProject = await projectsModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.send({ data: updatedProject });
    } catch (error) {
        console.error('Error al actualizar proyecto:', error.message);
        handleError(res, "ERROR_UPDATE_PROJECT");
    }
};

/**
 * Obtener todos los proyectos del usuario actual (no archivados)
 */
const getProjects = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { clientId } = req.query;
        
        const filter = { 
            createdBy: userId,
            isArchived: false
        };
        
        // Filtrar por cliente si se proporciona clientId
        if (clientId) {
            // Verificar que el cliente exista y pertenezca al usuario
            const client = await clientsModel.findOne({ 
                _id: clientId, 
                createdBy: userId 
            });
            
            if (!client) {
                return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
            }
            
            filter.clientId = clientId;
        }
        
        const projects = await projectsModel.find(filter);
        res.send({ data: projects });
    } catch (error) {
        console.error('Error al obtener proyectos:', error.message);
        handleError(res, "ERROR_GET_PROJECTS");
    }
};

/**
 * Obtener un proyecto específico (solo si pertenece al usuario)
 */
const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const project = await projectsModel.findOne({
            _id: id,
            createdBy: userId
        }).populate('clientId', 'name email'); // Opcional: incluir datos del cliente

        if (!project) {
            return handleError(res, "PROJECT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ data: project });
    } catch (error) {
        console.error('Error al obtener proyecto:', error.message);
        handleError(res, "ERROR_GET_PROJECT");
    }
};

/**
 * Archivar proyecto (soft delete)
 */
const archiveProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const project = await projectsModel.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { isArchived: true },
            { new: true }
        );

        if (!project) {
            return handleError(res, "PROJECT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ data: project });
    } catch (error) {
        console.error('Error al archivar proyecto:', error.message);
        handleError(res, "ERROR_ARCHIVE_PROJECT");
    }
};

/**
 * Eliminar proyecto permanentemente (hard delete)
 */
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const project = await projectsModel.findOneAndDelete({
            _id: id,
            createdBy: userId
        });

        if (!project) {
            return handleError(res, "PROJECT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ message: "PROJECT_DELETED" });
    } catch (error) {
        console.error('Error al eliminar proyecto:', error.message);
        handleError(res, "ERROR_DELETE_PROJECT");
    }
};

/**
 * Obtener proyectos archivados del usuario
 */
const getArchivedProjects = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { clientId } = req.query;
        
        const filter = { 
            createdBy: userId,
            isArchived: true
        };
        
        // Filtrar por cliente si se proporciona clientId
        if (clientId) {
            // Verificar que el cliente exista y pertenezca al usuario
            const client = await clientsModel.findOne({ 
                _id: clientId, 
                createdBy: userId 
            });
            
            if (!client) {
                return handleError(res, "CLIENT_NOT_FOUND_OR_NOT_OWNER", 404);
            }
            
            filter.clientId = clientId;
        }
        
        const projects = await projectsModel.find(filter);
        res.send({ data: projects });
    } catch (error) {
        console.error('Error al obtener proyectos archivados:', error.message);
        handleError(res, "ERROR_GET_ARCHIVED_PROJECTS");
    }
};

/**
 * Restaurar proyecto archivado
 */
const restoreProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId } = req.user;

        const project = await projectsModel.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { isArchived: false },
            { new: true }
        );

        if (!project) {
            return handleError(res, "PROJECT_NOT_FOUND_OR_NOT_OWNER", 404);
        }

        res.send({ data: project });
    } catch (error) {
        console.error('Error al restaurar proyecto:', error.message);
        handleError(res, "ERROR_RESTORE_PROJECT");
    }
};

module.exports = {
    createProject,
    updateProject,
    getProjects,
    getProject,
    archiveProject,
    deleteProject,
    getArchivedProjects,
    restoreProject
};