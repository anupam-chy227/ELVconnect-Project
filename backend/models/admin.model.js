const { pool, query } = require("../config/db");

const projectSelect = `
  p.id,
  p.customer_id,
  p.category,
  p.location_lat,
  p.location_lng,
  p.budget,
  p.description,
  p.images,
  p.status,
  p.created_at,
  p.updated_at,
  u.full_name AS customer_name,
  u.email AS customer_email,
  active_assignment.vendor_id AS assigned_vendor_id,
  active_assignment.company_name AS assigned_vendor_company
`;

const findAllProjects = async ({ status = null, category = null, limit = 50, offset = 0 }) => {
  const params = [];
  const where = [];

  if (status) {
    params.push(status);
    where.push(`p.status = $${params.length}`);
  }

  if (category) {
    params.push(category);
    where.push(`p.category = $${params.length}`);
  }

  params.push(limit);
  const limitIndex = params.length;
  params.push(offset);
  const offsetIndex = params.length;

  const result = await query(
    `
      SELECT ${projectSelect}
      FROM projects p
      JOIN users u ON u.id = p.customer_id
      LEFT JOIN LATERAL (
        SELECT
          pva.vendor_id,
          vp.company_name
        FROM project_vendor_assignments pva
        JOIN vendor_profiles vp ON vp.id = pva.vendor_id
        WHERE pva.project_id = p.id AND pva.active = true
        ORDER BY pva.created_at DESC
        LIMIT 1
      ) active_assignment ON true
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY p.created_at DESC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    params
  );

  return result.rows;
};

const approveVendor = async ({ vendor_id, admin_id }) => {
  const result = await query(
    `
      UPDATE vendor_profiles
      SET
        status = 'approved',
        reviewed_by = $2,
        reviewed_at = NOW(),
        rejection_reason = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [vendor_id, admin_id]
  );

  return result.rows[0] || null;
};

const reassignVendor = async ({ project_id, vendor_id, admin_id, reason = null }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectResult = await client.query(
      "SELECT * FROM projects WHERE id = $1 LIMIT 1",
      [project_id]
    );
    const project = projectResult.rows[0] || null;

    const vendorResult = await client.query(
      "SELECT * FROM vendor_profiles WHERE id = $1 LIMIT 1",
      [vendor_id]
    );
    const vendor = vendorResult.rows[0] || null;

    if (!project || !vendor) {
      await client.query("ROLLBACK");
      return { project, vendor, assignment: null };
    }

    if (vendor.status !== "approved") {
      await client.query("ROLLBACK");
      return { project, vendor, assignment: null };
    }

    await client.query(
      `
        UPDATE project_vendor_assignments
        SET active = false, unassigned_at = NOW(), updated_at = NOW()
        WHERE project_id = $1 AND active = true
      `,
      [project_id]
    );

    const assignmentResult = await client.query(
      `
        INSERT INTO project_vendor_assignments (
          project_id,
          vendor_id,
          assigned_by,
          reason,
          active
        )
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
      `,
      [project_id, vendor_id, admin_id, reason]
    );

    await client.query(
      "UPDATE projects SET status = 'assigned', updated_at = NOW() WHERE id = $1",
      [project_id]
    );

    await client.query("COMMIT");

    return {
      project,
      vendor,
      assignment: assignmentResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const findDelayedProjects = async ({ threshold_days = 7, limit = 50, offset = 0 }) => {
  const result = await query(
    `
      WITH milestone_progress AS (
        SELECT
          project_id,
          COUNT(*) FILTER (WHERE status = 'completed') AS completed_milestones,
          MAX(updated_at) AS last_milestone_update
        FROM project_milestones
        GROUP BY project_id
      )
      SELECT
        ${projectSelect},
        COALESCE(mp.completed_milestones, 0) AS completed_milestones,
        5 AS total_milestones,
        ROUND((COALESCE(mp.completed_milestones, 0)::numeric / 5) * 100, 0) AS progress_percentage,
        COALESCE(mp.last_milestone_update, p.updated_at, p.created_at) AS last_activity_at,
        EXTRACT(
          DAY FROM NOW() - COALESCE(mp.last_milestone_update, p.updated_at, p.created_at)
        )::integer AS delayed_days
      FROM projects p
      JOIN users u ON u.id = p.customer_id
      LEFT JOIN milestone_progress mp ON mp.project_id = p.id
      LEFT JOIN LATERAL (
        SELECT
          pva.vendor_id,
          vp.company_name
        FROM project_vendor_assignments pva
        JOIN vendor_profiles vp ON vp.id = pva.vendor_id
        WHERE pva.project_id = p.id AND pva.active = true
        ORDER BY pva.created_at DESC
        LIMIT 1
      ) active_assignment ON true
      WHERE
        p.status IN ('open', 'assigned', 'in_progress')
        AND COALESCE(mp.completed_milestones, 0) < 5
        AND COALESCE(mp.last_milestone_update, p.updated_at, p.created_at)
          < NOW() - ($1::integer * INTERVAL '1 day')
      ORDER BY delayed_days DESC, p.created_at ASC
      LIMIT $2
      OFFSET $3
    `,
    [threshold_days, limit, offset]
  );

  return result.rows;
};

module.exports = {
  findAllProjects,
  approveVendor,
  reassignVendor,
  findDelayedProjects,
};
