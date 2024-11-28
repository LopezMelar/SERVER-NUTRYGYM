const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const RecipeController = require('../controllers/recipeController');
const ProgressController = require('../controllers/progressController');
const StatsController = require('../controllers/statsController'); // Nuevo controlador
const authenticateToken = require('../middlewares/authMiddleware');

// Rutas existentes (mantenerlas)
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/complete-profile', authenticateToken, UserController.completeProfile);
router.get('/recipes/:objetivo', authenticateToken, RecipeController.getRecipesByObjective);
router.get('/progress', authenticateToken, ProgressController.getProgress);
router.post('/progress', authenticateToken, ProgressController.updateProgress);

// Nueva ruta para obtener estadísticas
router.get('/stats', authenticateToken, StatsController.getStats);

module.exports = router;
