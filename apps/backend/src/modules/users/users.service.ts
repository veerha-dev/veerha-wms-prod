import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { DatabaseService } from '../../database/database.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class UsersService {
  constructor(

    private repository: UsersRepository,
    private db: DatabaseService,
  ) {}

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const user = await this.repository.findById(getCurrentTenantId(), id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto & { password?: string }) {
    const existing = await this.repository.findByEmail(getCurrentTenantId(), dto.email);
    if (existing) throw new ConflictException(`User with email ${dto.email} already exists`);

    // Hash password if provided — user can login immediately
    let passwordHash = null;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 12);
    }

    return this.repository.create(getCurrentTenantId(), { ...dto, passwordHash });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    if (dto.email) {
      const existing = await this.repository.findByEmail(getCurrentTenantId(), dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Email ${dto.email} is already in use`);
      }
    }
    return this.repository.update(getCurrentTenantId(), id, dto);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(getCurrentTenantId(), id);
  }

  async invite(dto: CreateUserDto & { password?: string }) {
    const existing = await this.repository.findByEmail(getCurrentTenantId(), dto.email);
    if (existing) throw new ConflictException(`User with email ${dto.email} already exists`);

    // Auto-generate temporary password if not provided
    const tempPassword = dto.password || this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.repository.create(getCurrentTenantId(), {
      ...dto,
      passwordHash,
      isActive: true,
      mustChangePassword: true,
    });

    // Return the temp password so caller can email it / display once
    return { ...user, temporaryPassword: tempPassword };
  }

  async resetPassword(id: string) {
    await this.findById(id);
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await this.db.query(
      `UPDATE users SET password_hash = $1, must_change_password = true, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [passwordHash, id, getCurrentTenantId()],
    );
    return { id, temporaryPassword: tempPassword };
  }

  private generateTempPassword(): string {
    // 12 chars: 3 letters + 1 special + 3 letters + 1 special + 4 digits → meets complexity rules
    const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const specials = '!@#$%^&*';
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
    const segs = [
      pick(upper), pick(lower), pick(lower),
      pick(specials),
      pick(upper), pick(lower), pick(lower),
      pick(specials),
      pick(digits), pick(digits), pick(digits), pick(digits),
    ];
    return segs.join('');
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.repository.setActive(getCurrentTenantId(), id, false);
  }

  async reactivate(id: string) {
    await this.findById(id);
    return this.repository.setActive(getCurrentTenantId(), id, true);
  }

  async getStats() {
    return this.repository.getStats(getCurrentTenantId());
  }

  // ─── Permissions ───────────────────────────────────────────

  async getPermissions() {
    const result = await this.db.query(
      `SELECT role, module, action, allowed FROM role_permissions WHERE tenant_id = $1 ORDER BY module, action, role`,
      [getCurrentTenantId()],
    );

    // Group into the matrix format the frontend expects: { module, action, admin, manager, worker }
    const matrix: Record<string, Record<string, Record<string, boolean>>> = {};
    for (const row of result.rows) {
      if (!matrix[row.module]) matrix[row.module] = {};
      if (!matrix[row.module][row.action]) matrix[row.module][row.action] = {};
      matrix[row.module][row.action][row.role] = row.allowed;
    }

    const permissions: any[] = [];
    for (const [module, actions] of Object.entries(matrix)) {
      for (const [action, roles] of Object.entries(actions)) {
        permissions.push({
          module,
          action,
          admin: roles.admin ?? true,
          manager: roles.manager ?? false,
          worker: roles.worker ?? false,
        });
      }
    }

    return permissions;
  }

  async updatePermissions(permissions: any[]) {
    for (const perm of permissions) {
      for (const role of ['admin', 'manager', 'worker']) {
        const allowed = perm[role] ?? false;
        await this.db.query(
          `INSERT INTO role_permissions (tenant_id, role, module, action, allowed, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (tenant_id, role, module, action)
           DO UPDATE SET allowed = $5, updated_at = NOW()`,
          [getCurrentTenantId(), role, perm.module, perm.action, allowed],
        );
      }
    }
    return this.getPermissions();
  }
}
