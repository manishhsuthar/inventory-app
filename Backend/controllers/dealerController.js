import { pool } from '../config/db.js';

const getDealersColumns = async () => {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'dealers'`,
  );
  return new Set(result.rows.map((r) => r.column_name));
};

export const getDealers = async (req, res) => {
  try {
    const columns = await getDealersColumns();
    const orderBy = columns.has('created_at') ? 'created_at DESC' : 'id DESC';
    const result = await pool.query(`SELECT * FROM dealers ORDER BY ${orderBy}`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addDealer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const columns = await getDealersColumns();

    const data = {
      name,
      phone: phone || '',
      address: address || '',
    };

    const supported = ['name', 'phone', 'address'].filter((column) => columns.has(column));
    if (!supported.includes('name')) {
      return res.status(500).json({ error: 'Dealers table is missing required column: name' });
    }

    const placeholders = supported.map((_, i) => `$${i + 1}`).join(', ');
    const values = supported.map((column) => data[column]);

    const result = await pool.query(
      `INSERT INTO dealers (${supported.join(', ')})
       VALUES (${placeholders})
       RETURNING *`,
      values,
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
