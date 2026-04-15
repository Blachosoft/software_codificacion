# API REST — CRUD de Productos con JWT

API REST para gestión de catálogo de productos con autenticación JWT. Nivel 3 Avanzado.

---

## Estructura del proyecto

```
crud-productos/
├── src/
│   ├── config.js              → Clave secreta del JWT
│   ├── data/
│   │   ├── usuarios.js        → Usuarios precargados en memoria
│   │   └── productos.js       → Almacenamiento de productos en memoria
│   ├── middlewares/
│   │   └── auth.js            → Middleware de verificación JWT
│   └── routes/
│       ├── auth.js            → POST /auth
│       └── productos.js       → CRUD /productos
├── app.js                     → Entrada principal del servidor
├── package.json
├── api.http                   → Ejemplos de peticiones para REST Client (VS Code)
└── README.md
```

---

## Instalación y ejecución

**1. Instalar dependencias:**
```bash
npm install
```

**2. Iniciar el servidor:**
```bash
node app.js
```

El servidor corre en: `http://localhost:3000`

**Modo desarrollo (recarga automática):**
```bash
npm run dev
```

---

## Qué es JWT (explicado simple)

JWT (JSON Web Token) es como un **ticket firmado**:

1. El usuario manda su usuario y password a `POST /auth`
2. El servidor verifica las credenciales y crea un token firmado con su información
3. El cliente guarda ese token y lo manda en cada petición
4. El servidor verifica la firma para asegurarse de que nadie lo alteró
5. Si el token expiró (después de 1 hora) ya no es válido

**Estructura del JWT:**
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsInVzdWFyaW8iOiJhZG1pbiJ9.firma
  ↑ HEADER (algoritmo)   ↑ PAYLOAD (datos del usuario)         ↑ FIRMA
```

**NO necesitas AWS** para esto. JWT es solo una librería de Node.js.

---

## Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth` | Login — retorna un JWT |

### Productos (requieren JWT en el header)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/productos` | Listar productos (con filtros y paginación) |
| GET | `/productos/:id` | Obtener producto por ID |
| POST | `/productos` | Crear producto |
| PUT | `/productos/:id` | Actualizar producto |
| DELETE | `/productos/:id` | Eliminar producto |

---

## Usuarios precargados

| usuario | password | activo |
|---------|----------|--------|
| admin | admin123 | true |
| estudiante | est2025 | true |
| inactivo | noactivo1 | false |

---

## Filtros disponibles en GET /productos

```
GET /productos?subcategoria=bebidas
GET /productos?estado=activo
GET /productos?nombre=coca
GET /productos?subcategoria=bebidas&estado=activo
GET /productos?page=1&limit=5
GET /productos?nombre=pan&page=1&limit=3
```

---

## Códigos de error

| Código HTTP | Code | Descripción |
|-------------|------|-------------|
| 401 | NO_TOKEN | No se envió el token |
| 401 | INVALID_TOKEN | Token inválido o malformado |
| 401 | TOKEN_EXPIRED | El token expiró (después de 1 hora) |
| 401 | INVALID_CREDENTIALS | Usuario o contraseña incorrectos |
| 403 | USER_INACTIVE | Usuario inactivo |
| 404 | PRODUCT_NOT_FOUND | Producto no encontrado |
| 400 | VALIDATION_ERROR | Datos de entrada inválidos |

---

## Probar la API

**Opción 1 — VS Code REST Client:** Abrir el archivo `api.http` e instalar la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

**Opción 2 — Postman:** Importar las peticiones del archivo `api.http`

**Opción 3 — curl:**
```bash
# Login
curl -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "password": "admin123"}'

# Copiar el token de la respuesta y usarlo en:
curl http://localhost:3000/productos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```
