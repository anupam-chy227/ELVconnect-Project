const { query } = require("../config/db");
const ApiError = require("../utils/ApiError");

const VENDOR_MATCHING_SQL = `
  WITH vendor_distances AS (
    SELECT
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
      (
        6371 * ACOS(
          LEAST(
            1,
            GREATEST(
              -1,
              COS(RADIANS($2)) * COS(RADIANS(location_lat)) *
              COS(RADIANS(location_lng) - RADIANS($3)) +
              SIN(RADIANS($2)) * SIN(RADIANS(location_lat))
            )
          )
        )
      ) AS distance_km
    FROM vendor_profiles
    WHERE
      status = 'approved'
      AND category = $1
      AND location_lat IS NOT NULL
      AND location_lng IS NOT NULL
  ),
  scored_vendors AS (
    SELECT
      *,
      GREATEST(0, (1 - (distance_km / service_radius))) * 5 AS distance_score,
      (
        (rating * 0.4) +
        (GREATEST(0, (1 - (distance_km / service_radius))) * 5 * 0.2) +
        (performance_score * 0.4)
      ) AS score
    FROM vendor_distances
    WHERE distance_km <= service_radius
  )
  SELECT
    id,
    owner_id,
    company_name,
    category,
    location_lat,
    location_lng,
    service_radius,
    rating,
    distance_km,
    distance_score,
    performance_score,
    score,
    certifications,
    documents,
    status
  FROM scored_vendors
  ORDER BY score DESC, rating DESC, distance_km ASC
  LIMIT $4;
`;

const allowedCategories = new Set([
  "CCTV",
  "Fire",
  "Networking",
  "Access Control",
  "BMS",
  "PA System",
  "Intercom",
  "Gate Automation",
  "Other",
]);

const formatVendorMatch = (vendor) => ({
  id: vendor.id,
  owner_id: vendor.owner_id,
  company_name: vendor.company_name,
  category: vendor.category,
  location: {
    lat: Number(vendor.location_lat),
    lng: Number(vendor.location_lng),
  },
  service_radius: Number(vendor.service_radius),
  rating: Number(vendor.rating),
  distance_km: Number(Number(vendor.distance_km).toFixed(2)),
  distance_score: Number(Number(vendor.distance_score).toFixed(2)),
  performance_score: Number(vendor.performance_score),
  score: Number(Number(vendor.score).toFixed(2)),
  certifications: vendor.certifications,
  documents: vendor.documents,
  status: vendor.status,
});

const getTopVendorMatches = async ({ category, location, limit = 5 }) => {
  const projectCategory = String(category || "").trim();
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 5);

  if (!allowedCategories.has(projectCategory)) {
    throw new ApiError(400, "category is invalid");
  }

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new ApiError(400, "location.lat must be a valid latitude");
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new ApiError(400, "location.lng must be a valid longitude");
  }

  const result = await query(VENDOR_MATCHING_SQL, [
    projectCategory,
    lat,
    lng,
    safeLimit,
  ]);

  return result.rows.map(formatVendorMatch);
};

module.exports = {
  VENDOR_MATCHING_SQL,
  getTopVendorMatches,
};
