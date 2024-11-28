const db = require('../database');

const Progress = {};

Progress.getDailyProgress = (userId) => {
    const query = `
        SELECT * FROM progreso_diario
        WHERE id_usuario = ? AND fecha = CURDATE()
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

Progress.resetDailyProgress = () => {
    const query = `UPDATE progreso_diario SET calorias_consumidas = 0 WHERE fecha = CURDATE()`;
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = Progress;
