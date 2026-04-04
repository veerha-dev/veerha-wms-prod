import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function updateZoneRackCounts() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Updating zone rack counts...');

    const result = await pool.query(`
      UPDATE zones 
      SET rack_count = (
        SELECT COUNT(*) 
        FROM racks 
        WHERE racks.zone_id = zones.id
      )
    `);

    console.log('✅ Zone rack counts updated successfully');
    console.log(`   Rows affected: ${result.rowCount}`);

    // Verify the update
    const zones = await pool.query('SELECT id, name, rack_count FROM zones ORDER BY name');
    console.log('\n📊 Current zone rack counts:');
    zones.rows.forEach(zone => {
      console.log(`   ${zone.name}: ${zone.rack_count} racks`);
    });

  } catch (error) {
    console.error('❌ Error updating zone rack counts:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

updateZoneRackCounts();
