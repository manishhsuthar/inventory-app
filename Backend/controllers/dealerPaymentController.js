import { pool } from '../config/db.js';

const hasDealerPaymentsTable = async () => {
  const result = await pool.query('SELECT to_regclass($1) AS regclass', ['public.dealer_payments']);
  return Boolean(result.rows[0]?.regclass);
};

const ensureDealerPaymentsTable = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dealer_payments (
      id TEXT PRIMARY KEY DEFAULT 'dp_' || md5(random()::text || clock_timestamp()::text),
      dealer_id TEXT NOT NULL,
      amount NUMERIC NOT NULL DEFAULT 0,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      note TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  );
};

const getDealerPaymentsColumns = async () => {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'dealer_payments'`,
  );
  return new Set(result.rows.map((r) => r.column_name));
};

export const getDealerPayments = async (req, res) => {
  try {
    const tableExists = await hasDealerPaymentsTable();
    if (!tableExists) {
      await ensureDealerPaymentsTable();
    }

    const columns = await getDealerPaymentsColumns();
    const orderBy = columns.has('created_at')
      ? 'created_at DESC'
      : columns.has('date')
        ? 'date DESC'
        : 'id DESC';
    const result = await pool.query(`SELECT * FROM dealer_payments ORDER BY ${orderBy}`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addDealerPayment = async (req, res) => {
  try {
    const tableExists = await hasDealerPaymentsTable();
    if (!tableExists) {
      await ensureDealerPaymentsTable();
    }

    const { dealer_id, amount, date, note } = req.body;
    const result = await pool.query(
      `INSERT INTO dealer_payments (dealer_id, amount, date, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dealer_id, amount, date, note || ''],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
