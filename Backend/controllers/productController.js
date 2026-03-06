import { pool } from '../config/db.js';

const getProductsColumns = async () => {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'products'`,
  );
  return new Set(result.rows.map((r) => r.column_name));
};

const hasTable = async (tableName) => {
  const result = await pool.query('SELECT to_regclass($1) AS regclass', [`public.${tableName}`]);
  return Boolean(result.rows[0]?.regclass);
};

export const getProducts = async (req, res) => {
  try {
    const productColumns = await getProductsColumns();
    const orderBy = productColumns.has('created_at') ? 'p.created_at DESC' : 'p.id DESC';
    const [purchasesExists, salesExists] = await Promise.all([
      hasTable('purchases'),
      hasTable('sales'),
    ]);

    const result = purchasesExists && salesExists
      ? await pool.query(
          `SELECT
            p.*,
            COALESCE((
              SELECT SUM(quantity)::int FROM purchases WHERE product_id = p.id
            ), 0) - COALESCE((
              SELECT SUM(quantity)::int FROM sales WHERE product_id = p.id
            ), 0) AS current_stock
          FROM products p
          ORDER BY ${orderBy}`,
        )
      : await pool.query(
          `SELECT p.*, 0::int AS current_stock
           FROM products p
           ORDER BY ${orderBy}`,
        );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, category, cost_price, selling_price, min_stock, unit } = req.body;
    const columns = await getProductsColumns();

    const data = {
      name,
      category: category || null,
      cost_price,
      selling_price,
      min_stock: min_stock || 0,
      unit: unit || 'pcs',
    };

    const supported = ['name', 'category', 'cost_price', 'selling_price', 'min_stock', 'unit']
      .filter((column) => columns.has(column));

    if (!supported.includes('name')) {
      return res.status(500).json({ error: 'Products table is missing required column: name' });
    }

    const placeholders = supported.map((_, i) => `$${i + 1}`).join(', ');
    const values = supported.map((column) => data[column]);

    const result = await pool.query(
      `INSERT INTO products (${supported.join(', ')})
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
