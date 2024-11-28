const db = require('../database');

const StatsController = {};

// Obtener estadísticas generales del usuario
StatsController.getStats = (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT fecha, SUM(calorias_consumidas) AS calorias_totales, MAX(meta_calorias) AS meta_calorias
        FROM progreso_diario
        WHERE id_usuario = ?
        GROUP BY fecha
        ORDER BY fecha DESC
        LIMIT 7
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener estadísticas:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
        }

        if (results.length === 0) {
            return res.status(200).json({ success: true, data: [], message: 'No hay estadísticas disponibles' });
        }

        res.status(200).json({ success: true, data: results });
    });
};
module.exports = StatsController;
