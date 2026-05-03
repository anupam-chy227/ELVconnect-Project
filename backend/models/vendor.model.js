const { query } = require("../config/db");

const vendorFields = `
  id,
  owner_id,
  company_name,
  category,
  location_lat,
  location_lng,
  service_radius,
  rating,
  performance_score,
  certifications,
  documents,
  status,
  reviewed_by,
  reviewed_at,
  rejection_reason,
  created_at,
  updated_at
`;

const create = async ({
  owner_id,
  company_name,
  category,
  location_lat = null,
  location_lng = null,
  service_radius,
  rating = 0,
  performance_score = 0,
  certifications,
  documents,
}) => {
  const result = await query(
    `
      INSERT INTO vendor_profiles (
        owner_id,
        company_name,
        category,
        location_lat,
        location_lng,
        service_radius,
        rating,
        performance_score,
        certifications,
        documents,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING ${vendorFields}
    `,
    [
      owner_id,
      company_name,
      category,
      location_lat,
      location_lng,
      service_radius,
      rating,
      performance_score,
      certifications,
      documents,
    ]
  );

  return result.rows[0];
};

const findById = async (id) => {
  const result = await query(
    `SELECT ${vendorFields} FROM vendor_profiles WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
};

const findByOwnerId = async (owner_id) => {
  const result = await query(
    `SELECT ${vendorFields} FROM vendor_profiles WHERE owner_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [owner_id]
  );

  return result.rows[0] || null;
};

const updateStatus = async ({ id, status, reviewed_by, rejection_reason = null }) => {
  const result = await query(
    `
      UPDATE vendor_profiles
      SET
        status = $2,
        reviewed_by = $3,
        reviewed_at = NOW(),
        rejection_reason = $4,
        updated_at = NOW()
      WHERE id = $1
      RETURNING ${vendorFields}
    `,
    [id, status, reviewed_by, rejection_reason]
  );

  return result.rows[0] || null;
};

module.exports = {
  create,
  findById,
  findByOwnerId,
  updateStatus,
};
