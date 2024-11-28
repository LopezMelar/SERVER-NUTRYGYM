const db = require('../database');

const RecipeController = {};

// Obtener recetas según el objetivo
RecipeController.getRecipesByObjective = (req, res) => {
    const { objetivo } = req.params;

    const query = `SELECT * FROM recetas WHERE tipo_objetivo = ?`;
    db.query(query, [objetivo], (err, results) => {
        if (err) {
            console.error('Error al obtener recetas:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener recetas' });
        }

        res.status(200).json({ success: true, data: results });
    });
};

module.exports = RecipeController;