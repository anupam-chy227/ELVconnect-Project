const { query } = require("../config/db");

const quoteFields = `
  id,
  project_id,
  vendor_id,
  amount,
  boq_details,
  status,
  created_at,
  updated_at
`;

const quoteSelectFields = `
  q.id,
  q.project_id,
  q.vendor_id,
  q.amount,
  q.boq_details,
  q.status,
  q.created_at,
  q.updated_at
`;

const create = async ({ project_id, vendor_id, amount, boq_details }) => {
  const result = await query(
    `
      INSERT INTO quotes (
        project_id,
        vendor_id,
        amount,
        boq_details,
        status
      )
      VALUES ($1, $2, $3, $4, 'submitted')
      RETURNING ${quoteFields}
    `,
    [project_id, vendor_id, amount, JSON.stringify(boq_details)]
  );

  return result.rows[0];
};

const findByProjectId = async (project_id) => {
  const result = await query(
    `
      SELECT
        ${quoteSelectFields},
        v.company_name,
        v.rating,
        v.performance_score
      FROM quotes q
      JOIN vendor_profiles v ON v.id = q.vendor_id
      WHERE q.project_id = $1
      ORDER BY q.amount ASC, v.rating DESC, q.created_at ASC
    `,
    [project_id]
  );

  return result.rows;
};

const findByProjectAndVendor = async ({ project_id, vendor_id }) => {
  const result = await query(
    `
      SELECT ${quoteFields}
      FROM quotes
      WHERE project_id = $1 AND vendor_id = $2
      LIMIT 1
    `,
    [project_id, vendor_id]
  );

  return result.rows[0] || null;
};

module.exports = {
  create,
  findByProjectId,
  findByProjectAndVendor,
};
