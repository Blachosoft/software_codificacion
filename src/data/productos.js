const fs   = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Cargar datos desde disco al arrancar
function _load() {
  if (fs.existsSync(DB_FILE)) {
    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch {}
  }
  return { productos: [], nextId: 1 };
}

const stored   = _load();
const productos = stored.productos;
let nextId      = stored.nextId;

function getNextId() {
  return nextId++;
}

// Guardar estado actual en disco
function save() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify({ productos, nextId }, null, 2));
}

module.exports = { productos, getNextId, save };
