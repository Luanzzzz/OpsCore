import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./src/db/schema/inbox.ts",
    "./src/db/schema/tasks.ts",
    "./src/db/schema/agenda.ts"
  ],
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@localhost:5432/opscore"
  }
});
