import { pool } from '../config/db.js';

const hasSalesTable = async () => {
  const result = await pool.query('SELECT to_regclass($1) AS regclass', ['public.sales']);
  return Boolean(result.rows[0]?.regclass);
};

const getSalesColumns = async () => {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'sales'`,
  );
  return new Set(result.rows.map((r) => r.column_name));
};

export const getSales = async (req, res) => {
  try {
    const tableExists = await hasSalesTable();
    if (!tableExists) {
      return res.json([]);
    }

    const columns = await getSalesColumns();
    const orderBy = columns.has('created_at')
      ? 'created_at DESC'
      : columns.has('date')
        ? 'date DESC'
        : 'id DESC';
    const result = await pool.query(`SELECT * FROM sales ORDER BY ${orderBy}`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addSale = async (req, res) => {
  try {
    const tableExists = await hasSalesTable();
    if (!tableExists) {
      return res.status(400).json({ error: 'sales table does not exist in database' });
    }

    const { product_id, quantity, unit_price, customer_name, date } = req.body;
    const totalAmount = Number(quantity) * Number(unit_price);
    const columns = await getSalesColumns();

    const data = {
      product_id,
      quantity,
      unit_price,
      total_amount: totalAmount,
      customer_name: customer_name || '',
      date,
    };

    const supported = ['product_id', 'quantity', 'unit_price', 'total_amount', 'customer_name', 'date']
      .filter((column) => columns.has(column));

    const required = ['product_id', 'quantity'];
    for (const col of required) {
      if (!supported.includes(col)) {
        return res.status(500).json({ error: `Sales table is missing required column: ${col}` });
      }
    }

    const placeholders = supported.map((_, i) => `$${i + 1}`).join(', ');
    const values = supported.map((column) => data[column]);

    const result = await pool.query(
      `INSERT INTO sales (${supported.join(', ')})
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
