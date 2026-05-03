if (!process.env.JWT_SECRET && process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_SECRET = process.env.JWT_ACCESS_SECRET;
}

const required = ["JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const parseOrigins = (value) =>
  value
    ? value.split(",").map((origin) => origin.trim()).filter(Boolean)
    : ["http://localhost:3000"];

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  databaseUrl: process.env.DATABASE_URL,
  db: {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || "elv_connect",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  },
};

module.exports = { env };
