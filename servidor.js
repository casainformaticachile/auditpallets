const express = require('express');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));
const archivo = path.join(__dirname, 'pallets.json');

// Asegurar que el archivo exista
if (!fs.existsSync(archivo)) {
  fs.writeFileSync(archivo, '[]');
}

// Obtener todos los pallets
app.get('/pallets', (req, res) => {
  const data = fs.readFileSync(archivo, 'utf8');
  const pallets = JSON.parse(data);
  res.json(pallets);
});

// Guardar nuevo pallet
app.post('/guardar', (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ status: 'error', message: 'Código vacío' });

  const data = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf8')) : [];

  const duplicado = data.find(p => p.codigo === codigo);
  if (duplicado) {
    return res.json({ status: 'duplicado', fecha: duplicado.fecha });
  }

  const fecha = DateTime.now().setZone('America/Los_Angeles').toFormat('yyyy-MM-dd HH:mm:ss');
  const nuevo = { codigo, fecha };
  data.push(nuevo);
  fs.writeFileSync(archivo, JSON.stringify(data, null, 2));
  res.json({ status: 'ok' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});