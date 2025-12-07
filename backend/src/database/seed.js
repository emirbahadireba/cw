import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if default tenant exists
    const tenantCheck = await client.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      ['demo']
    );
    
    if (tenantCheck.rows.length === 0) {
      // Create default tenant
      const tenantResult = await client.query(
        `INSERT INTO tenants (name, subdomain, plan, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['Demo Şirketi', 'demo', 'premium', 'active']
      );
      
      const tenantId = tenantResult.rows[0].id;
      
      // Create default admin user
      const passwordHash = await bcrypt.hash('password', 10);
      await client.query(
        `INSERT INTO users (tenant_id, email, password_hash, name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tenantId, 'admin@example.com', passwordHash, 'Admin User', 'admin', true]
      );
      
      console.log('✓ Created default tenant and admin user');
      console.log('  Email: admin@example.com');
      console.log('  Password: password');
    } else {
      console.log('Default tenant already exists, skipping...');
    }
    
    await client.query('COMMIT');
    console.log('Seed completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);

