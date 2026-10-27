#!/usr/bin/env bun
/**
 * Push the Prisma schema to Turso using @libsql/client.
 *
 * Prisma's `sqlite` provider doesn't accept `libsql://` URLs from `db push`,
 * so we generate the SQL via `prisma migrate diff` and apply it here.
 */
import { createClient } from "@libsql/client";
import { execSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_DATABASE_URL is required");
  process.exit(1);
}

// Generate SQL diff from schema
const tmpSql = join(mkdtempSync(join(tmpdir(), "prisma-")), "schema.sql");
execSync(
  `bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script --output ${tmpSql}`,
  { stdio: "inherit" }
);
const sql = await Bun.file(tmpSql).text();

const client = createClient({ url, authToken: token });

// Drop existing tables (to allow re-push during development), then run.
const tableNames = [
  "Cita",
  "Vehiculo",
  "Cliente",
  "Servicio",
  "HorarioTaller",
  "_prisma_migrations",
];
for (const t of tableNames) {
  try {
    await client.execute(`DROP TABLE IF EXISTS "${t}";`);
  } catch (e) {
    console.warn(`drop ${t}:`, e.message);
  }
}

// Execute statements one by one
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`Applying ${statements.length} statements to Turso...`);
for (const stmt of statements) {
  try {
    await client.execute(stmt + ";");
  } catch (e) {
    console.warn("stmt failed:", e.message, "->", stmt.slice(0, 80));
  }
}
console.log("✅ Schema pushed to Turso");

writeFileSync(".schema-pushed", new Date().toISOString());
