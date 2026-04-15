const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

/**
 * Middleware de autenticación JWT.
 * 
 * Qué hace JWT (explicado simple):
 * 1. Cuando el usuario hace login en /auth, el servidor firma un "ticket" (token) con su información.
 * 2. El cliente guarda ese token y lo manda en cada petición como header: Authorization: Bearer <token>
 * 3. Este middleware verifica que el token sea válido y no haya expirado.
 * 4. Si todo está bien, deja pasar la petición. Si no, responde con 401 o 403.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Verificar que el header Authorization existe y tiene formato "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'NO_TOKEN',
        message: 'Token de autenticación requerido'
      }
    });
  }

  // Extraer el token (quitar el prefijo "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // jwt.verify valida la firma y la expiración automáticamente
    const payload = jwt.verify(token, JWT_SECRET);

    // Verificar que el usuario esté activo
    if (!payload.activo) {
      return res.status(403).json({
        error: {
          code: 'USER_INACTIVE',
          message: 'Usuario inactivo, acceso denegado'
        }
      });
    }

    // Guardar el payload en req.user para usarlo en las rutas si es necesario
    req.user = payload;
    next();
  } catch (err) {
    // Si el token expiró, jsonwebtoken lanza TokenExpiredError
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'El token ha expirado. Por favor vuelva a iniciar sesión'
        }
      });
    }

    // Cualquier otro error (firma inválida, token malformado, etc.)
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido'
      }
    });
  }
}

module.exports = authMiddleware;
