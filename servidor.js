const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname)); // Sirve index.html directamente

const archivoPallets = path.join(__dirname, 'pallets.json');

// Crear archivo vacío si no existe
if (!fs.existsSync(archivoPallets)) {
  fs.writeFileSync(archivoPallets, '[]');
}

// POST /guardar - Agrega un pallet con fecha actual
app.post('/guardar', (req, res) => {
  const { codigo } = req.body;
  if (!codigo) {
    return res.status(400).json({ status: 'error', message: 'Código requerido' });
  }

  const data = JSON.parse(fs.readFileSync(archivoPallets, 'utf8'));

  const yaExiste = data.some(p => p.codigo === codigo && esHoy(p.fecha));
  if (yaExiste) {
    return res.json({ status: 'duplicate' });
  }

  const nuevo = {
    codigo,
    fecha: new Date().toISOString()
  };

  data.push(nuevo);
  fs.writeFileSync(archivoPallets, JSON.stringify(data, null, 2));

  return res.json({ status: 'ok' });
});

// GET /hoy - Devuelve los pallets auditados hoy
app.get('/hoy', (req, res) => {
  const data = JSON.parse(fs.readFileSync(archivoPallets, 'utf8'));
  const hoy = data.filter(p => esHoy(p.fecha));
  return res.json(hoy);
});

// GET /todos - Devuelve todos los pallets registrados
app.get('/todos', (req, res) => {
  const data = JSON.parse(fs.readFileSync(archivoPallets, 'utf8'));
  return res.json(data);
});

// Función auxiliar para verificar si una fecha es de hoy
function esHoy(fechaStr) {
  const f = new Date(fechaStr);
  const ahora = new Date();
  return f.getFullYear() === ahora.getFullYear() &&
         f.getMonth() === ahora.getMonth() &&
         f.getDate() === ahora.getDate();
}

// Puerto requerido por Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
