const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://drbsauditpaslletsdb_user:JE6FOtUVTUaMvPnfeUPe33RKeDVlc4LE@dpg-d26md78gjchc73e5a3bg-a.oregon-postgres.render.com/drbsauditpaslletsdb',
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());

// Servir archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Obtener todos los pallets
app.get('/api/pallets', async (req, res) => {
  try {
    const result = await pool.query('SELECT codigo, fecha FROM pallets ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error leyendo datos:', err);
    res.status(500).json({ error: 'Error leyendo datos.' });
  }
});

// Agregar nuevo pallet
app.post('/api/pallets', async (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Falta el código del pallet.' });

  const ahora = new Date();
  const fecha = ahora.getFullYear() +
    '-' + String(ahora.getMonth() + 1).padStart(2, '0') +
    '-' + String(ahora.getDate()).padStart(2, '0') +
    ' ' + String(ahora.getHours()).padStart(2, '0') +
    ':' + String(ahora.getMinutes()).padStart(2, '0') +
    ':' + String(ahora.getSeconds()).padStart(2, '0');

  try {
    await pool.query('INSERT INTO pallets (codigo, fecha) VALUES ($1, $2)', [codigo, fecha]);
    res.json({ ok: true, agregado: { codigo, fecha } });
  } catch (err) {
    console.error('Error guardando datos:', err);
    res.status(500).json({ error: 'Error guardando datos.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});