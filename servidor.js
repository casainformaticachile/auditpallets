const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const FILE_PATH = path.join(__dirname, 'pallets.json');
const VERSION_JS = "VerJS: 202507312328";

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Verifica si el archivo existe y está bien formado
function cargarDatos() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, "[]", "utf-8");
    return [];
  }
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("ERROR AL LEER JSON:", err);
    return [];
  }
}

function guardarDatos(data) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("ERROR AL GUARDAR JSON:", err);
  }
}

app.post('/guardar', (req, res) => {
  const codigo = req.body.codigo?.trim();
  if (!codigo) return res.status(400).json({ status: "error", message: "Código vacío" });

  const datosActuales = cargarDatos();
  const existe = datosActuales.find(d => d.codigo === codigo);
  if (existe) {
    return res.json({ status: "duplicate" });
  }

  const ahora = new Date();
  ahora.setHours(ahora.getHours() - 7); // Ajuste de zona horaria
  const fecha = ahora.toISOString().replace("T", " ").substring(0, 19);

  const nuevo = { codigo, fecha };
  datosActuales.push(nuevo);
  guardarDatos(datosActuales);

  res.json({ status: "ok" });
});

app.get('/hoy', (req, res) => {
  const hoy = new Date();
  hoy.setHours(hoy.getHours() - 7); // Aseguramos el huso horario -7
  const fechaHoy = hoy.toISOString().slice(0, 10);
  const datosActuales = cargarDatos();
  const filtrados = datosActuales.filter(d => d.fecha?.startsWith(fechaHoy));
  res.json(filtrados);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
