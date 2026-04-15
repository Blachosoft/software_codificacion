const express = require('express');
const path = require('path');
const app = express();

// Permitir peticiones desde cualquier origen (necesario para el frontend)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());

// Servir el frontend desde http://localhost:3000
app.use(express.static(path.join(__dirname)));

// Ruta raíz → redirigir al login
app.get('/', (req, res) => res.redirect('/login.html'));

// Rutas
const authRoutes = require('./src/routes/auth');
const productosRoutes = require('./src/routes/productos');

app.use('/auth', authRoutes);
app.use('/productos', productosRoutes);

// Puerto del servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
