const { query } = require("../config/db");

const documentFields = `
  id,
  project_id,
  uploaded_by,
  document_type,
  title,
  file_url,
  file_name,
  mime_type,
  created_at,
  updated_at
`;

const create = async ({
  project_id,
  uploaded_by,
  document_type,
  title,
  file_url,
  file_name = null,
  mime_type = null,
}) => {
  const result = await query(
    `
      INSERT INTO project_documents (
        project_id,
        uploaded_by,
        document_type,
        title,
        file_url,
        file_name,
        mime_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${documentFields}
    `,
    [project_id, uploaded_by, document_type, title, file_url, file_name, mime_type]
  );

  return result.rows[0];
};

const findById = async (id) => {
  const result = await query(
    `SELECT ${documentFields} FROM project_documents WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
};

const findByProjectId = async (project_id, document_type = null) => {
  const params = [project_id];
  let whereClause = "WHERE project_id = $1";

  if (document_type) {
    params.push(document_type);
    whereClause += " AND document_type = $2";
  }

  const result = await query(
    `
      SELECT ${documentFields}
      FROM project_documents
      ${whereClause}
      ORDER BY created_at DESC
    `,
    params
  );

  return result.rows;
};

module.exports = {
  create,
  findById,
  findByProjectId,
};
