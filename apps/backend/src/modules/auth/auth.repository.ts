import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AuthRepository {
  constructor(private db: DatabaseService) {}

  async findUserByEmail(email: string) {
    const result = await this.db.query(
      `SELECT id, email, full_name, role, tenant_id, is_active, password_hash,
              must_change_password, warehouse_id, phone, token_version
       FROM users
       WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async createUser(email: string, fullName: string, passwordHash: string, role: string = 'operator', tenantId: string) {
    const result = await this.db.query(
      `INSERT INTO users (email, full_name, password_hash, role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, email, full_name, role, tenant_id, is_active, created_at`,
      [email, fullName, passwordHash, role, tenantId]
    );
    return result.rows[0];
  }

  async findUserById(id: string) {
    const result = await this.db.query(
      `SELECT id, email, full_name, role, tenant_id, is_active, last_login,
              must_change_password, warehouse_id, phone, token_version, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async bumpTokenVersion(userId: string) {
    await this.db.query(
      `UPDATE users SET token_version = COALESCE(token_version, 0) + 1, updated_at = NOW() WHERE id = $1`,
      [userId]
    );
  }

  async updateLastLogin(userId: string) {
    await this.db.query(
      `UPDATE users SET last_login = NOW() WHERE id = $1`,
      [userId]
    );
  }

  async findUserWithHashById(id: string) {
    const result = await this.db.query(
      `SELECT id, email, full_name, role, tenant_id, is_active, password_hash
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async updatePasswordHash(userId: string, hash: string) {
    await this.db.query(
      `UPDATE users SET password_hash = $1, must_change_password = false, updated_at = NOW() WHERE id = $2`,
      [hash, userId]
    );
  }
}
