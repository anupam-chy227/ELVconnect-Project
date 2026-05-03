const asyncHandler = require("../utils/asyncHandler");
const { query } = require("../config/db");

const healthCheck = asyncHandler(async (_req, res) => {
  await query("SELECT 1");

  res.status(200).json({
    success: true,
    service: "ELV Connect API",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});

module.exports = { healthCheck };
