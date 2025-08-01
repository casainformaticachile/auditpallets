const express = require('express');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const archivo = path.join(__dirname, 'pallets.json');
if (!fs.existsSync(archivo)) fs.writeFileSync(archivo, '[]');

app.get('/pallets', (req, res) => {
  const data = fs.readFileSync(archivo, 'utf8');
  res.json(JSON.parse(data));
});

app.post('/guardar', (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ status: 'error' });

  const data = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  const existente = data.find(p => p.codigo === codigo);
  if (existente) return res.json({ status: 'duplicado', fecha: existente.fecha });

  const fecha = DateTime.now().setZone("America/Los_Angeles").toFormat("yyyy-MM-dd HH:mm:ss");
  data.push({ codigo, fecha });
  fs.writeFileSync(archivo, JSON.stringify(data, null, 2));
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});