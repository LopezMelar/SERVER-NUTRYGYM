const cron = require('node-cron');
const db = require('../database');

// Reiniciar progreso diario a las 23:59
cron.schedule('59 23 * * *', () => {
    const query = `UPDATE progreso_diario SET calorias_consumidas = 0 WHERE fecha = CURDATE()`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al reiniciar progreso diario:', err);
        } else {
            console.log('Progreso diario reiniciado exitosamente.');
        }
    });
});

module.exports = cron;
