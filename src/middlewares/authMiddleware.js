const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del encabezado

    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado. Token faltante.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }

        req.user = user; // Adjunta los datos del usuario autenticado al objeto de la solicitud
        next();
    });
};

module.exports = authenticateToken;
