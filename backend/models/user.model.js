const { query } = require("../config/db");

const publicFields = `
  id,
  full_name AS "fullName",
  email,
  role,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const findByEmail = async (email) => {
  const result = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await query(`SELECT ${publicFields} FROM users WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] || null;
};

const create = async ({ fullName, email, passwordHash, role = "customer" }) => {
  const result = await query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING ${publicFields}
    `,
    [fullName, email, passwordHash, role]
  );

  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  create,
};
