const express = require('express');
const morgan = require('morgan');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno
require('./cronJobs/resetProgress'); // Importa la tarea programada

// Inicializar la aplicación
const app = express();

// Configuración del puerto
app.set('port', process.env.PORT || 4000);

// Middlewares
app.use(morgan('dev')); // Para ver solicitudes en la consola
app.use(express.json()); // Para procesar solicitudes en formato JSON

// Rutas
app.use('/users', require('./routes/users'));

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error(err.stack); // Esto muestra el error en la consola
    res.status(500).json({
        message: 'Error interno del servidor',
        error: err.message, // Muestra más detalles solo en desarrollo
    });
});

// Iniciar el servidor
app.listen(app.get('port'), () => {
    console.log('Server en el puerto', app.get('port'));
});
