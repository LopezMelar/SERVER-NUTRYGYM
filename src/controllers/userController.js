const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Modelo de usuario
const db = require('../database'); // Asegúrate de que la ruta sea correcta

const UserController = {};

// Registro de usuario
UserController.register = async (req, res, next) => {
    const { nombre_usuario, apellido_usuario, correo_usuario, contraseña_usuario } = req.body;

    if (!nombre_usuario || !apellido_usuario || !correo_usuario || !contraseña_usuario) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el correo ya existe
        User.findByEmail(correo_usuario, async (err, user) => {
            if (err) {
                console.error('Error al buscar el correo:', err);
                return res.status(500).json({ success: false, message: 'Error interno del servidor' });
            }

            if (user) {
                return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
            }

            // Si no existe, proceder con el registro
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(contraseña_usuario, saltRounds);

            User.create(
                { nombre_usuario, apellido_usuario, correo_usuario, contraseña_usuario: hashedPassword },
                (err, result) => {
                    if (err) {
                        console.error('Error al registrar el usuario:', err);
                        return res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Usuario registrado exitosamente',
                        user: { id: result.insertId },
                    });
                }
            );
        });
    } catch (err) {
        next(err);
    }
};


// Inicio de sesión
UserController.login = async (req, res, next) => {
    const { correo_usuario, contraseña_usuario } = req.body;

    if (!correo_usuario || !contraseña_usuario) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        User.findByEmail(correo_usuario, async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error interno del servidor' });
            }

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const isPasswordValid = await bcrypt.compare(contraseña_usuario, user.contraseña_usuario);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { id: user.id_usuario, correo: user.correo_usuario },
                process.env.JWT_SECRET || 'clave_secreta',
                { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id: user.id_usuario,
                    nombre: user.nombre_usuario,
                    correo: user.correo_usuario,
                    perfil_completo: user.perfil_completo === 1, // Convierte el valor a booleano
                    objetivo: user.objetivo, // Asegúrate de incluir este campo
                    genero_usuario: user.genero_usuario, // Incluye el género
                    peso_usuario: user.peso_usuario, // Incluye el peso
                    altura_usuario: user.altura_usuario, // Incluye la altura
                    fecha_nacimiento: user.fecha_nacimiento, // Incluye la fecha de nacimiento    
                },
                success: true
            });
        });
    } catch (err) {
        next(err);
    }
};

UserController.completeProfile = async (req, res, next) => {
    const { genero_usuario, altura_usuario, peso_usuario, objetivo, fecha_nacimiento } = req.body;
    const userId = req.user.id;

    if (!genero_usuario || !altura_usuario || !peso_usuario || !objetivo || !fecha_nacimiento) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son obligatorios',
        });
    }

    try {
        const queryUpdate = `
            UPDATE usuarios
            SET genero_usuario = ?, altura_usuario = ?, peso_usuario = ?, objetivo = ?, perfil_completo = 1, fecha_nacimiento = ?
            WHERE id_usuario = ?
        `;

        db.query(queryUpdate, [genero_usuario, altura_usuario, peso_usuario, objetivo, fecha_nacimiento, userId], (err, result) => {
            if (err) {
                console.error('Error al actualizar el perfil:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al completar el perfil',
                    error: err.message,
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                });
            }

            // Recuperar el usuario actualizado
            const querySelect = `SELECT id_usuario AS id, nombre_usuario AS nombre, correo_usuario AS correo, genero_usuario, peso_usuario, altura_usuario, fecha_nacimiento, objetivo, perfil_completo FROM usuarios WHERE id_usuario = ?`;
            db.query(querySelect, [userId], (err, rows) => {
                if (err) {
                    console.error('Error al recuperar el perfil actualizado:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al recuperar el perfil actualizado',
                        error: err.message,
                    });
                }

                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado después de actualizar',
                    });
                }

                const user = rows[0];
                res.status(200).json({
                    success: true,
                    message: 'Perfil completado exitosamente',
                    user, // Incluye el usuario actualizado
                });
            });
        });
    } catch (err) {
        console.error('Error en completeProfile:', err);
        next(err);
    }
};

module.exports = UserController;
