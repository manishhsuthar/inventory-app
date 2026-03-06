import { pool } from '../config/db.js';

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
    const { product_id, dealer_id, quantity, unit_price, date } = req.body;
    const totalAmount = Number(quantity) * Number(unit_price);
    const result = await pool.query(
      `INSERT INTO purchases (product_id, dealer_id, quantity, unit_price, total_amount, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [product_id, dealer_id, quantity, unit_price, totalAmount, date],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
