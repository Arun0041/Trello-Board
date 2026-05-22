import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  console.log('🔄 Connecting to PostgreSQL...');
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not defined in your server/.env file.');
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    const seedSql = await fs.readFile(seedPath, 'utf8');

    console.log('📂 Executing schema.sql to build tables...');
    await pool.query(schemaSql);
    console.log('✅ Tables and indices created successfully.');

    console.log('🌱 Executing seed.sql to populate sample data...');
    await pool.query(seedSql);
    console.log('✅ Sample data seeded successfully.');

    console.log('🎉 PostgreSQL Database setup completed successfully!');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
