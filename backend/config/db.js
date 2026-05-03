const { Pool } = require("pg");
const { env } = require("./env");

const pool = new Pool(
  env.databaseUrl
    ? {
        connectionString: env.databaseUrl,
        ssl: env.db.ssl,
      }
    : env.db
);

const query = (text, params) => pool.query(text, params);

const testConnection = async () => {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL connection established");
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
