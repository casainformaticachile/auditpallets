const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());

// Servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Obtener todos los pallets
app.get('/api/pallets', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo datos.' });
    res.json(JSON.parse(data || '[]'));
  });
});

// Agregar un nuevo pallet con código y fecha/hora local
app.post('/api/pallets', (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Falta el código del pallet.' });

  // Fecha y hora local en formato YYYY-MM-DD HH:mm:ss
  const ahora = new Date();
  const fecha = ahora.getFullYear() +
    '-' + String(ahora.getMonth() + 1).padStart(2, '0') +
    '-' + String(ahora.getDate()).padStart(2, '0') +
    ' ' + String(ahora.getHours()).padStart(2, '0') +
    ':' + String(ahora.getMinutes()).padStart(2, '0') +
    ':' + String(ahora.getSeconds()).padStart(2, '0');

  const nuevo = { codigo, fecha };
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    let pallets = [];
    if (!err && data) pallets = JSON.parse(data);
    pallets.push(nuevo);
    fs.writeFile(DATA_FILE, JSON.stringify(pallets, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error guardando datos.' });
      res.json({ ok: true, agregado: nuevo });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});