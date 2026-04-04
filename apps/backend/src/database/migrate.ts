import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const useSSL = dbUrl.includes('sslmode=require') || dbUrl.includes('neon.tech') || dbUrl.includes('supabase');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query('SELECT name FROM _migrations ORDER BY id');
  return result.rows.map((row) => row.name);
}

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  await createMigrationsTable();
  const executed = await getExecutedMigrations();

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let count = 0;

  for (const file of files) {
    if (executed.includes(file)) {
      console.log(`⏭️  Skipping: ${file} (already executed)`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      console.log(`✅ Executed: ${file}`);
      count++;
    } catch (error) {
      console.error(`❌ Failed: ${file}`);
      console.error(error);
      process.exit(1);
    }
  }

  if (count === 0) {
    console.log('\n✨ No new migrations to run');
  } else {
    console.log(`\n✨ Executed ${count} migration(s)`);
  }

  await pool.end();
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
