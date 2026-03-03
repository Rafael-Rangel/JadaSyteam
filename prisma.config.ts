// Carrega .env só quando DATABASE_URL não está definido (ex.: dev local).
// Em produção o host define DATABASE_URL; dotenv não é necessário.
if (!process.env.DATABASE_URL) {
  try {
    require("dotenv").config();
  } catch {
    // dotenv opcional (ex.: devDependency em produção)
  }
}

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // CLI (migrate, status) usa DIRECT_URL (session mode, 5432) para evitar erro "prepared statement already exists" com PgBouncer.
  // O app continua usando DATABASE_URL (pooler 6543) em lib/prisma.ts.
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
