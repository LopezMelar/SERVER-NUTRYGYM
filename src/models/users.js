const bcrypt = require('bcrypt'); // Importar bcrypt
const pool = require('../database'); // Importar la conexión a la base de datos

const User = {}; // Crear un objeto para definir funciones del modelo

// Crear un usuario
User.create = (data, callback) => {
    const query = `
        INSERT INTO usuarios (nombre_usuario, apellido_usuario, correo_usuario, contraseña_usuario)
        VALUES (?, ?, ?, ?)
    `;
    const { nombre_usuario, apellido_usuario, correo_usuario, contraseña_usuario } = data;

    pool.query(query, [nombre_usuario, apellido_usuario, correo_usuario, contraseña_usuario], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

// Buscar un usuario por correo
User.findByEmail = (correo_usuario, callback) => {
    const query = `SELECT * FROM usuarios WHERE correo_usuario = ?`;

    pool.query(query, [correo_usuario], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0] || null); // Retorna el usuario o null
    });
};

module.exports = User;