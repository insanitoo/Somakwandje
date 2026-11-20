import bcrypt from "bcryptjs";
import pg from "pg";

const username = process.env.ADMIN_USERNAME?.trim() || "admin";
const password = process.env.ADMIN_PASSWORD;

if (!password) {
  throw new Error("Set ADMIN_PASSWORD in Replit Secrets before running this script.");
}

if (password.length < 14) {
  throw new Error("ADMIN_PASSWORD must be at least 14 characters.");
}

if (Buffer.byteLength(password, "utf8") > 72) {
  throw new Error("ADMIN_PASSWORD must be no more than 72 UTF-8 bytes.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to create or update the admin account.");
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO usuarios (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, passwordHash],
  );

  console.info("Admin account created or updated.");
} catch {
  console.error("Could not create or update the admin account.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
