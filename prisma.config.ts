import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Optional here so `prisma generate` (npm postinstall, Vercel builds) works without a database.
  // Commands that connect (migrate, seed, studio) still fail clearly if DATABASE_URL is unset.
  ...(process.env.DATABASE_URL ? { datasource: { url: process.env.DATABASE_URL } } : {}),
});
