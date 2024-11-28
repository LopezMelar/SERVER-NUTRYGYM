const db = require('../database');

const ProgressController = {};

// Obtener progreso del usuario
ProgressController.getProgress = (req, res) => {
    const userId = req.user.id;

    console.log('User ID:', userId); // Para verificar que el ID se esté obteniendo correctamente

    const query = `
        SELECT 
            p.fecha, 
            SUM(p.calorias_consumidas) AS calorias_totales,
            CASE 
                WHEN u.genero_usuario = 'masculino' THEN 
                    88.36 + (13.4 * u.peso_usuario) + (4.8 * u.altura_usuario) - (5.7 * TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()))
                WHEN u.genero_usuario = 'femenino' THEN 
                    447.6 + (9.2 * u.peso_usuario) + (3.1 * u.altura_usuario) - (4.3 * TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()))
                ELSE 0
            END AS tmb,
            CASE 
                WHEN u.objetivo = 'adelgazar' THEN 
                    (CASE 
                        WHEN u.genero_usuario = 'masculino' THEN 
                            (88.36 + (13.4 * u.peso_usuario) + (4.8 * u.altura_usuario) - (5.7 * TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()))) * 0.8
                        ELSE 
                            (447.6 + (9.2 * u.peso_usuario) + (3.1 * u.altura_usuario) - (4.3 * TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()))) * 0.8
                    END)
                WHEN u.objetivo = 'aumentar' THEN 
                    (CASE 
                        WHEN u.genero_usuario = 'masculino' THEN 
                            (88.36 + (13.4 * u.peso_usuario) + (4.8 * u.altura_usuario) - (5.7 * TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()))) * 1.2
                        ELSE 
                            (447.6 + (9.2 * u.peso_usuario) + (3.1 * u.altura_usuario) - (4.3 * TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()))) * 1.2
                    END)
                ELSE 0
            END AS meta_calorias
        FROM progreso_diario p
        INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_usuario = ? AND p.fecha = CURDATE()
        GROUP BY p.fecha;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener progreso:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener progreso' });
        }

        console.log('Resultados de la consulta:', results); // Añade este log

        res.status(200).json({ success: true, data: results });
    });
};


// Actualizar progreso del usuario
ProgressController.updateProgress = (req, res) => {
    const userId = req.user.id;
    const { caloriasConsumidas, caloriasObjetivo } = req.body;

    console.log('Datos recibidos:', { caloriasConsumidas, caloriasObjetivo }); // Añade esto

    const query = `
        INSERT INTO progreso_diario (id_usuario, fecha, calorias_consumidas, meta_calorias)
        VALUES (?, CURDATE(), ?, ?)
        ON DUPLICATE KEY UPDATE 
        calorias_consumidas = calorias_consumidas + VALUES(calorias_consumidas),
        meta_calorias = VALUES(meta_calorias);
    `;

    db.query(query, [userId, caloriasConsumidas, caloriasObjetivo], (err, result) => {
        if (err) {
            console.error('Error al actualizar progreso:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar progreso' });
        }

        res.status(200).json({ success: true, message: 'Progreso actualizado correctamente' });
    });
};
module.exports = ProgressController;
