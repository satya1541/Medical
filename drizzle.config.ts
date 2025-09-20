import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: "40.192.41.79",
    user: "satya",
    password: "Satya@12345",
    database: "MED_DB",
    port: 3306
  },
});
