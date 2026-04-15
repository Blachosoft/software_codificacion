const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { productos, getNextId, save } = require('../data/productos');

// ─────────────────────────────────────────────
// Función de validación de campos de un producto
// ─────────────────────────────────────────────
function validarProducto(body) {
  const errores = [];
  const camposObligatorios = ['nombre', 'descripcion', 'subcategoria', 'precio', 'cantidad', 'estado'];

  // Verificar que todos los campos obligatorios estén presentes
  for (const campo of camposObligatorios) {
    if (body[campo] === undefined || body[campo] === null || body[campo] === '') {
      errores.push({ field: campo, message: `El campo '${campo}' es obligatorio` });
    }
  }

  // Validar que precio sea un número positivo (solo si está presente)
  if (body.precio !== undefined && body.precio !== null && body.precio !== '') {
    if (typeof body.precio !== 'number' || body.precio <= 0) {
      if (!errores.find(e => e.field === 'precio')) {
        errores.push({ field: 'precio', message: 'Debe ser un número positivo' });
      }
    }
  }

  // Validar que cantidad sea un número positivo (solo si está presente)
  if (body.cantidad !== undefined && body.cantidad !== null && body.cantidad !== '') {
    if (typeof body.cantidad !== 'number' || body.cantidad <= 0) {
      if (!errores.find(e => e.field === 'cantidad')) {
        errores.push({ field: 'cantidad', message: 'Debe ser un número positivo' });
      }
    }
  }

  // Validar que estado solo sea "activo" o "inactivo" (solo si está presente)
  if (body.estado !== undefined && body.estado !== null && body.estado !== '') {
    if (!['activo', 'inactivo'].includes(body.estado)) {
      if (!errores.find(e => e.field === 'estado')) {
        errores.push({ field: 'estado', message: "Solo se permite 'activo' o 'inactivo'" });
      }
    }
  }

  return errores;
}

// ─────────────────────────────────────────────
// Aplicar el middleware JWT a TODAS las rutas de /productos
// ─────────────────────────────────────────────
router.use(authMiddleware);

// ─────────────────────────────────────────────
// GET /productos
// Lista todos los productos con filtros opcionales y paginación
// ─────────────────────────────────────────────
router.get('/', (req, res) => {
  let resultado = productos.filter(p => !p.deletedAt);

  const { subcategoria, estado, nombre, page, limit } = req.query;

  // Filtro por subcategoria (exacto, case-insensitive)
  if (subcategoria) {
    resultado = resultado.filter(
      p => p.subcategoria.toLowerCase() === subcategoria.toLowerCase()
    );
  }

  // Filtro por estado (exacto, case-insensitive)
  if (estado) {
    resultado = resultado.filter(
      p => p.estado.toLowerCase() === estado.toLowerCase()
    );
  }

  // Búsqueda por nombre (coincidencia parcial, case-insensitive)
  if (nombre) {
    resultado = resultado.filter(
      p => p.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }

  const total = resultado.length;

  // Paginación (solo si se envía page o limit)
  if (page || limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const start = (pageNum - 1) * limitNum;

    resultado = resultado.slice(start, start + limitNum);

    return res.status(200).json({
      data: resultado,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  }

  return res.status(200).json({ data: resultado });
});

// ─────────────────────────────────────────────
// GET /productos/:id
// Obtener un producto por su ID
// ─────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id && !p.deletedAt);

  if (!producto) {
    return res.status(404).json({
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: `No se encontró el producto con id ${id}`
      }
    });
  }

  return res.status(200).json({ data: producto });
});

// ─────────────────────────────────────────────
// POST /productos
// Crear un nuevo producto
// ─────────────────────────────────────────────
router.post('/', (req, res) => {
  const errores = validarProducto(req.body);

  if (errores.length > 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: errores
      }
    });
  }

  const { nombre, descripcion, subcategoria, precio, cantidad, estado } = req.body;

  const nuevoProducto = {
    id: getNextId(),
    nombre,
    descripcion,
    subcategoria,
    precio,
    cantidad,
    estado
  };

  productos.push(nuevoProducto);
  save();

  return res.status(201).json({ data: nuevoProducto });
});

// ─────────────────────────────────────────────
// PUT /productos/:id
// Actualizar un producto existente
// ─────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productos.findIndex(p => p.id === id && !p.deletedAt);

  if (index === -1) {
    return res.status(404).json({
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: `No se encontró el producto con id ${id}`
      }
    });
  }

  const errores = validarProducto(req.body);

  if (errores.length > 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: errores
      }
    });
  }

  const { nombre, descripcion, subcategoria, precio, cantidad, estado } = req.body;

  productos[index] = { id, nombre, descripcion, subcategoria, precio, cantidad, estado };
  save();

  return res.status(200).json({ data: productos[index] });
});

// ─────────────────────────────────────────────
// DELETE /productos/:id
// Eliminar un producto
// ─────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id && !p.deletedAt);

  if (!producto) {
    return res.status(404).json({
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: `No se encontró el producto con id ${id}`
      }
    });
  }

  producto.deletedAt = new Date().toISOString();
  save();

  return res.status(200).json({ data: { message: 'Producto eliminado exitosamente' } });
});

module.exports = router;
