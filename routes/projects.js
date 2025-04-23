const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/session');
const { validatorCreateProject, validatorGetProject } = require('../validators/projects');
const { 
    createProject, 
    updateProject, 
    getProjects, 
    getProject, 
    archiveProject, 
    deleteProject, 
    getArchivedProjects, 
    restoreProject 
} = require('../controllers/projects');

router.post('/', authMiddleware, validatorCreateProject, createProject);
router.put('/:id', authMiddleware, validatorGetProject, validatorCreateProject, updateProject);
router.patch('/:id', authMiddleware, validatorGetProject, validatorCreateProject, updateProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, validatorGetProject, getProject);
router.put('/:id/archive', authMiddleware, validatorGetProject, archiveProject);
router.delete('/:id', authMiddleware, validatorGetProject, deleteProject);
router.get('/archived/list', authMiddleware, getArchivedProjects);
router.put('/:id/restore', authMiddleware, validatorGetProject, restoreProject);

module.exports = router;