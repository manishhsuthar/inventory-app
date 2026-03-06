import { pool } from '../config/db.js';

const hasPurchasesTable = async () => {
  const result = await pool.query('SELECT to_regclass($1) AS regclass', ['public.purchases']);
  return Boolean(result.rows[0]?.regclass);
};

const getPurchasesColumns = async () => {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'purchases'`,
  );
  return new Set(result.rows.map((r) => r.column_name));
};

export const getPurchases = async (req, res) => {
  try {
    const tableExists = await hasPurchasesTable();
    if (!tableExists) {
      return res.json([]);
    }

    const columns = await getPurchasesColumns();
    const orderBy = columns.has('created_at')
      ? 'created_at DESC'
      : columns.has('date')
        ? 'date DESC'
        : 'id DESC';
    const result = await pool.query(`SELECT * FROM purchases ORDER BY ${orderBy}`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addPurchase = async (req, res) => {
  try {
    const tableExists = await hasPurchasesTable();
    if (!tableExists) {
      return res.status(400).json({ error: 'purchases table does not exist in database' });
    }

    const { product_id, dealer_id, quantity, unit_price, date } = req.body;
    const totalAmount = Number(quantity) * Number(unit_price);
    const columns = await getPurchasesColumns();

    const data = {
      product_id,
      dealer_id,
      quantity,
      unit_price,
      total_amount: totalAmount,
      date,
    };

    const supported = ['product_id', 'dealer_id', 'quantity', 'unit_price', 'total_amount', 'date']
      .filter((column) => columns.has(column));

    const required = ['product_id', 'quantity'];
    for (const col of required) {
      if (!supported.includes(col)) {
        return res.status(500).json({ error: `Purchases table is missing required column: ${col}` });
      }
    }

    const placeholders = supported.map((_, i) => `$${i + 1}`).join(', ');
    const values = supported.map((column) => data[column]);

    const result = await pool.query(
      `INSERT INTO purchases (${supported.join(', ')})
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
