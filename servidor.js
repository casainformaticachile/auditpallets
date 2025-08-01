
const express = require('express');
const fs = require('fs');
const { DateTime } = require('luxon');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const archivo = path.join(__dirname, 'pallets.json');

app.use(express.json());
app.use(express.static(__dirname));

// Cargar todos los pallets
app.get('/todos', (req, res) => {
  if (!fs.existsSync(archivo)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  res.json(data);
});

// Cargar solo los pallets auditados hoy
app.get('/hoy', (req, res) => {
  if (!fs.existsSync(archivo)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(archivo, 'utf8'));

  const hoy = new Date();
  const dataHoy = data.filter(p => {
    const fecha = new Date(p.fecha);
    return fecha.toDateString() === hoy.toDateString();
  });

  res.json(dataHoy);
});

// Guardar nuevo pallet
app.post('/guardar', (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ status: 'error', message: 'Código vacío' });

  const data = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf8')) : [];

  // Si ya existe el código, no lo guarda
  if (data.some(p => p.codigo === codigo)) {
    return res.json({ status: 'duplicado' });
  }

  // Guardar con hora local (UTC-4) manualmente corregida
  const fecha = DateTime.now().setZone('America/Los_Angeles').toFormat('yyyy-MM-dd HH:mm:ss');
const nuevo = { codigo, fecha };
  fs.writeFileSync(archivo, JSON.stringify(data, null, 2));
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Servidor auditando pallets en http://localhost:${PORT}`);
});