const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { usuarios } = require('../data/usuarios');

/**
 * POST /auth
 * Recibe usuario y password, valida las credenciales y devuelve un JWT firmado.
 */
router.post('/', (req, res) => {
  const { usuario, password } = req.body;

  // Validar que se enviaron los campos requeridos
  if (!usuario || !password) {
    return res.status(400).json({
      error: {
        code: 'MISSING_CREDENTIALS',
        message: 'Los campos usuario y password son obligatorios'
      }
    });
  }

  // Buscar el usuario en la lista en memoria
  const user = usuarios.find(u => u.usuario === usuario && u.password === password);

  if (!user) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Usuario o contraseña incorrectos'
      }
    });
  }

  // Crear el JWT con los datos del usuario
  // jwt.sign(payload, secreto, opciones)
  // expiresIn: '1h' → el token dura 1 hora, luego es inválido
  const token = jwt.sign(
    {
      sub: user.id,        // "subject": id del usuario
      usuario: user.usuario,
      activo: user.activo
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    data: {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    }
  });
});

module.exports = router;
