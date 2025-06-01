import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const connectionString = "postgresql://postgres.eebvsatjdxxtprnajgbv:dAr7I1BJ3hB7aTdo@aws-0-us-east-2.pooler.supabase.com:6543/postgres";

export const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema });