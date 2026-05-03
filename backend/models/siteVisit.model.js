const { query } = require("../config/db");

const siteVisitFields = `
  id,
  customer_id,
  vendor_id,
  project_id,
  scheduled_at,
  status,
  notes,
  completed_at,
  created_at,
  updated_at
`;

const create = async ({ customer_id, vendor_id, project_id = null, scheduled_at, notes = null }) => {
  const result = await query(
    `
      INSERT INTO site_visits (
        customer_id,
        vendor_id,
        project_id,
        scheduled_at,
        status,
        notes
      )
      VALUES ($1, $2, $3, $4, 'scheduled', $5)
      RETURNING ${siteVisitFields}
    `,
    [customer_id, vendor_id, project_id, scheduled_at, notes]
  );

  return result.rows[0];
};

const findById = async (id) => {
  const result = await query(
    `SELECT ${siteVisitFields} FROM site_visits WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
};

const findByCustomerId = async (customer_id) => {
  const result = await query(
    `
      SELECT ${siteVisitFields}
      FROM site_visits
      WHERE customer_id = $1
      ORDER BY scheduled_at DESC
    `,
    [customer_id]
  );

  return result.rows;
};

const findByVendorId = async (vendor_id) => {
  const result = await query(
    `
      SELECT ${siteVisitFields}
      FROM site_visits
      WHERE vendor_id = $1
      ORDER BY scheduled_at DESC
    `,
    [vendor_id]
  );

  return result.rows;
};

const updateStatus = async ({ id, status }) => {
  const result = await query(
    `
      UPDATE site_visits
      SET
        status = $2,
        completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING ${siteVisitFields}
    `,
    [id, status]
  );

  return result.rows[0] || null;
};

module.exports = {
  create,
  findById,
  findByCustomerId,
  findByVendorId,
  updateStatus,
};
