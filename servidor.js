const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// Ajusta tu connectionString al de tu base de datos real
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://drbsauditpaslletsdb_user:JE6FOtUVTUaMvPnfeUPe33RKeDVlc4LE@dpg-d26md78gjchc73e5a3bg-a.oregon-postgres.render.com/drbsauditpaslletsdb',
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/pallets', async (req, res) => {
  try {
    const result = await pool.query('SELECT codigo, fecha FROM pallets ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error leyendo datos:', err);
    res.status(500).json({ error: 'Error leyendo datos.' });
  }
});

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
    if (err.code === '23505') {
      res.status(409).json({ error: 'Código duplicado. Ya existe un pallet con ese código.' });
    } else {
      console.error('Error guardando datos:', err);
      res.status(500).json({ error: 'Error guardando datos.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});