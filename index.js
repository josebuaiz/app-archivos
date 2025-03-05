const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Carpeta donde se guardarán los archivos

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('archivos.db');

// Crear tabla para almacenar metadatos de archivos
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS archivos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      ruta TEXT,
      fecha TEXT
    )
  `);
});

// Ruta para subir archivos
app.post('/subir', upload.single('archivo'), (req, res) => {
  const { originalname, filename } = req.file;
  const ruta = path.join(__dirname, 'uploads', filename);
  const fecha = new Date().toISOString();

  // Guardar metadatos en la base de datos
  db.run(
    'INSERT INTO archivos (nombre, ruta, fecha) VALUES (?, ?, ?)',
    [originalname, ruta, fecha],
    (err) => {
      if (err) {
        return res.status(500).send('Error al guardar en la base de datos');
      }
      res.send('Archivo subido correctamente');
    }
  );
});

// Ruta para listar archivos
app.get('/archivos', (req, res) => {
  db.all('SELECT * FROM archivos', (err, rows) => {
    if (err) {
      return res.status(500).send('Error al leer la base de datos');
    }
    res.json(rows);
  });
});

// Servir archivos estáticos (frontend)
app.use(express.static('public'));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});