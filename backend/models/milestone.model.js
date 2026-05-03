const { query } = require("../config/db");

const milestoneFields = `
  id,
  project_id,
  stage,
  status,
  proof_images,
  notes,
  completed_at,
  created_at,
  updated_at
`;

const upsert = async ({ project_id, stage, status, proof_images, notes = null }) => {
  const result = await query(
    `
      INSERT INTO project_milestones (
        project_id,
        stage,
        status,
        proof_images,
        notes,
        completed_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        CASE WHEN $3 = 'completed' THEN NOW() ELSE NULL END
      )
      ON CONFLICT (project_id, stage)
      DO UPDATE SET
        status = EXCLUDED.status,
        proof_images = CASE
          WHEN array_length(EXCLUDED.proof_images, 1) IS NULL THEN project_milestones.proof_images
          ELSE project_milestones.proof_images || EXCLUDED.proof_images
        END,
        notes = COALESCE(EXCLUDED.notes, project_milestones.notes),
        completed_at = CASE
          WHEN EXCLUDED.status = 'completed' THEN COALESCE(project_milestones.completed_at, NOW())
          ELSE NULL
        END,
        updated_at = NOW()
      RETURNING ${milestoneFields}
    `,
    [project_id, stage, status, proof_images, notes]
  );

  return result.rows[0];
};

const findByProjectId = async (project_id) => {
  const result = await query(
    `
      SELECT ${milestoneFields}
      FROM project_milestones
      WHERE project_id = $1
      ORDER BY
        CASE stage
          WHEN 'survey' THEN 1
          WHEN 'quote' THEN 2
          WHEN 'installation' THEN 3
          WHEN 'testing' THEN 4
          WHEN 'handover' THEN 5
        END
    `,
    [project_id]
  );

  return result.rows;
};

module.exports = {
  upsert,
  findByProjectId,
};
