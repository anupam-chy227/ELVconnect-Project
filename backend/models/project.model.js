const { query } = require("../config/db");

const projectFields = `
  id,
  customer_id,
  category,
  location_lat,
  location_lng,
  budget,
  description,
  images,
  status,
  created_at,
  updated_at
`;

const create = async ({
  customer_id,
  category,
  location_lat,
  location_lng,
  budget,
  description,
  images,
}) => {
  const result = await query(
    `
      INSERT INTO projects (
        customer_id,
        category,
        location_lat,
        location_lng,
        budget,
        description,
        images,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
      RETURNING ${projectFields}
    `,
    [customer_id, category, location_lat, location_lng, budget, description, images]
  );

  return result.rows[0];
};

const findById = async (id) => {
  const result = await query(
    `SELECT ${projectFields} FROM projects WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
};

const findByCustomerId = async (customer_id) => {
  const result = await query(
    `
      SELECT ${projectFields}
      FROM projects
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `,
    [customer_id]
  );

  return result.rows;
};

const updateStatus = async ({ id, status }) => {
  const result = await query(
    `
      UPDATE projects
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING ${projectFields}
    `,
    [id, status]
  );

  return result.rows[0] || null;
};

module.exports = {
  create,
  findById,
  findByCustomerId,
  updateStatus,
};
