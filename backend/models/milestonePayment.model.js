const { query } = require("../config/db");

const paymentFields = `
  id,
  project_id,
  milestone_id,
  vendor_id,
  amount,
  currency,
  status,
  requested_by,
  approved_by,
  approved_at,
  rejected_reason,
  paid_at,
  created_at,
  updated_at
`;

const create = async ({
  project_id,
  milestone_id,
  vendor_id,
  amount,
  currency = "INR",
  requested_by,
}) => {
  const result = await query(
    `
      INSERT INTO milestone_payments (
        project_id,
        milestone_id,
        vendor_id,
        amount,
        currency,
        status,
        requested_by
      )
      VALUES ($1, $2, $3, $4, $5, 'pending_admin_approval', $6)
      RETURNING ${paymentFields}
    `,
    [project_id, milestone_id, vendor_id, amount, currency, requested_by]
  );

  return result.rows[0];
};

const findById = async (id) => {
  const result = await query(
    `SELECT ${paymentFields} FROM milestone_payments WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
};

const findByProjectId = async (project_id) => {
  const result = await query(
    `
      SELECT ${paymentFields}
      FROM milestone_payments
      WHERE project_id = $1
      ORDER BY created_at DESC
    `,
    [project_id]
  );

  return result.rows;
};

const findByMilestoneId = async (milestone_id) => {
  const result = await query(
    `
      SELECT ${paymentFields}
      FROM milestone_payments
      WHERE milestone_id = $1
      ORDER BY created_at DESC
    `,
    [milestone_id]
  );

  return result.rows;
};

const updateStatus = async ({
  id,
  status,
  approved_by = null,
  rejected_reason = null,
}) => {
  const result = await query(
    `
      UPDATE milestone_payments
      SET
        status = $2,
        approved_by = CASE WHEN $2 = 'approved' THEN $3 ELSE approved_by END,
        approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
        rejected_reason = CASE WHEN $2 = 'rejected' THEN $4 ELSE NULL END,
        paid_at = CASE WHEN $2 = 'paid' THEN NOW() ELSE paid_at END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING ${paymentFields}
    `,
    [id, status, approved_by, rejected_reason]
  );

  return result.rows[0] || null;
};

module.exports = {
  create,
  findById,
  findByProjectId,
  findByMilestoneId,
  updateStatus,
};
