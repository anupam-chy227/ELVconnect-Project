const { query } = require("../config/db");

const scoreFields = `
  id,
  vendor_id,
  completion_rate,
  quality,
  rating,
  response_time,
  compliance,
  score,
  scored_by,
  created_at,
  updated_at
`;

const UPSERT_VENDOR_SCORE_SQL = `
  WITH calculated_score AS (
    SELECT ROUND(
      (
        ($2::numeric * 0.25) +
        ($3::numeric * 0.25) +
        ($4::numeric * 0.20) +
        ($5::numeric * 0.15) +
        ($6::numeric * 0.15)
      ),
      2
    ) AS score
  ),
  saved_score AS (
    INSERT INTO vendor_score_metrics (
      vendor_id,
      completion_rate,
      quality,
      rating,
      response_time,
      compliance,
      score,
      scored_by
    )
    SELECT
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      score,
      $7
    FROM calculated_score
    ON CONFLICT (vendor_id)
    DO UPDATE SET
      completion_rate = EXCLUDED.completion_rate,
      quality = EXCLUDED.quality,
      rating = EXCLUDED.rating,
      response_time = EXCLUDED.response_time,
      compliance = EXCLUDED.compliance,
      score = EXCLUDED.score,
      scored_by = EXCLUDED.scored_by,
      updated_at = NOW()
    RETURNING ${scoreFields}
  )
  UPDATE vendor_profiles
  SET
    rating = saved_score.rating,
    performance_score = saved_score.score,
    updated_at = NOW()
  FROM saved_score
  WHERE vendor_profiles.id = saved_score.vendor_id
  RETURNING
    saved_score.id,
    saved_score.vendor_id,
    saved_score.completion_rate,
    saved_score.quality,
    saved_score.rating,
    saved_score.response_time,
    saved_score.compliance,
    saved_score.score,
    saved_score.scored_by,
    saved_score.created_at,
    saved_score.updated_at,
    vendor_profiles.company_name,
    vendor_profiles.performance_score;
`;

const upsertScore = async ({
  vendor_id,
  completion_rate,
  quality,
  rating,
  response_time,
  compliance,
  scored_by,
}) => {
  const result = await query(UPSERT_VENDOR_SCORE_SQL, [
    vendor_id,
    completion_rate,
    quality,
    rating,
    response_time,
    compliance,
    scored_by,
  ]);

  return result.rows[0] || null;
};

const findByVendorId = async (vendor_id) => {
  const result = await query(
    `
      SELECT ${scoreFields}
      FROM vendor_score_metrics
      WHERE vendor_id = $1
      LIMIT 1
    `,
    [vendor_id]
  );

  return result.rows[0] || null;
};

module.exports = {
  UPSERT_VENDOR_SCORE_SQL,
  upsertScore,
  findByVendorId,
};
