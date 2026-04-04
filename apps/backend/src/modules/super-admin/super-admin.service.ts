import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SuperAdminRepository } from './super-admin.repository';
import { CreateTenantDto } from './dto';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly repository: SuperAdminRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Auth ──────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const user = await this.repository.findSuperAdminByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      isSuperAdmin: true,
    };

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn: '24h',
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: true,
      },
    };
  }

  // ─── Dashboard ─────────────────────────────────────────────────────

  async getDashboardStats() {
    return this.repository.getDashboardStats();
  }

  // ─── Tenants ───────────────────────────────────────────────────────

  async getAllTenants() {
    return this.repository.getAllTenants();
  }

  async getTenantById(id: string) {
    const tenant = await this.repository.getTenantById(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async createTenant(dto: CreateTenantDto) {
    try {
    // Check for duplicate slug or email
    const existing = await this.repository.getAllTenants();
    if (existing.some((t: any) => t.slug === dto.slug)) {
      throw new BadRequestException(`Tenant with slug "${dto.slug}" already exists`);
    }

    const adminPasswordHash = await bcrypt.hash(dto.adminPassword, 12);

    const result = await this.repository.createTenant({
      slug: dto.slug,
      companyName: dto.companyName,
      adminEmail: dto.adminEmail,
      adminPasswordHash,
      adminName: dto.adminName,
      planCode: dto.planCode,
      billingCycle: dto.billingCycle,
      discountPercent: dto.discountPercent,
      notes: dto.notes,
    });

    return {
      ...result,
      adminCredentials: {
        email: dto.adminEmail,
        password: dto.adminPassword,
      },
    };
    } catch (error: any) {
      console.error('CREATE TENANT ERROR:', error.message, error.detail || '');
      throw error;
    }
  }

  async updateTenant(id: string, data: any) {
    const tenant = await this.repository.updateTenant(id, data);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async suspendTenant(id: string) {
    const tenant = await this.repository.suspendTenant(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async activateTenant(id: string) {
    const tenant = await this.repository.activateTenant(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async deleteTenant(id: string) {
    const deleted = await this.repository.deleteTenant(id);
    if (!deleted) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return { message: 'Tenant deleted successfully' };
  }

  // ─── Plans ─────────────────────────────────────────────────────────

  async getAllPlans() {
    return this.repository.getAllPlans();
  }

  async createPlan(data: any) {
    return this.repository.createPlan(data);
  }

  async updatePlan(id: string, data: any) {
    const plan = await this.repository.updatePlan(id, data);
    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    return plan;
  }

  // ─── Billing ───────────────────────────────────────────────────────

  async getAllInvoices() {
    return this.repository.getAllInvoices();
  }

  async createInvoice(data: any) {
    const countResult = await this.repository['db'].query('SELECT COUNT(*) as count FROM billing_invoices');
    const invoiceNumber = `SA-INV-${String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')}`;
    const amount = data.amount || 0;
    const tax = data.tax || data.taxAmount || 0;
    const discount = data.discount || 0;
    const total = amount + tax - discount;
    const now = new Date();
    return this.repository.createInvoice({
      tenantId: data.tenantId,
      invoiceNumber,
      amount, discount, taxAmount: tax, total,
      status: 'pending',
      dueDate: data.dueDate || new Date(now.getTime() + 30*24*60*60*1000).toISOString(),
      periodStart: data.periodStart || now.toISOString(),
      periodEnd: data.periodEnd || new Date(now.getTime() + 30*24*60*60*1000).toISOString(),
    });
  }

  async markInvoicePaid(id: string) {
    const invoice = await this.repository.markInvoicePaid(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }
    return invoice;
  }

  // ─── Usage ─────────────────────────────────────────────────────────

  async getUsageForTenant(tenantId: string) {
    await this.getTenantById(tenantId);
    return this.repository.getUsageForTenant(tenantId);
  }

  async getTenantUsers(tenantId: string) {
    const result = await this.repository['db'].query(
      `SELECT id, email, full_name, role, is_active, warehouse_id, last_login, created_at
       FROM users WHERE tenant_id = $1 ORDER BY role, full_name`,
      [tenantId],
    );
    return result.rows.map((r: any) => ({
      id: r.id, email: r.email, fullName: r.full_name, role: r.role,
      isActive: r.is_active, warehouseId: r.warehouse_id,
      lastLogin: r.last_login, createdAt: r.created_at,
    }));
  }

  async getTenantWarehouses(tenantId: string) {
    const result = await this.repository['db'].query(
      `SELECT id, name, type, city, status, total_capacity, current_occupancy, created_at
       FROM warehouses WHERE tenant_id = $1 ORDER BY name`,
      [tenantId],
    );
    return result.rows.map((r: any) => ({
      id: r.id, name: r.name, type: r.type, city: r.city, status: r.status,
      totalCapacity: parseInt(r.total_capacity || 0), currentOccupancy: parseInt(r.current_occupancy || 0),
      utilization: r.total_capacity > 0 ? Math.round((r.current_occupancy / r.total_capacity) * 100) : 0,
      createdAt: r.created_at,
    }));
  }

  async getFeatureFlags(tenantId: string) {
    const result = await this.repository['db'].query(
      'SELECT feature_flags FROM tenants WHERE id = $1', [tenantId],
    );
    return result.rows[0]?.feature_flags || {};
  }

  async updateFeatureFlags(tenantId: string, flags: any) {
    await this.repository['db'].query(
      'UPDATE tenants SET feature_flags = $1 WHERE id = $2', [JSON.stringify(flags), tenantId],
    );
    return flags;
  }

  async getTenantNotes(tenantId: string) {
    const result = await this.repository['db'].query(
      'SELECT internal_notes FROM tenants WHERE id = $1', [tenantId],
    );
    return result.rows[0]?.internal_notes || [];
  }

  async addTenantNote(tenantId: string, text: string) {
    const existing = await this.getTenantNotes(tenantId);
    const notes = [...existing, { text, createdAt: new Date().toISOString(), id: Date.now().toString() }];
    await this.repository['db'].query(
      'UPDATE tenants SET internal_notes = $1 WHERE id = $2', [JSON.stringify(notes), tenantId],
    );
    return notes;
  }

  async getAuditLogs() {
    const result = await this.repository['db'].query(
      `SELECT al.*, u.full_name as admin_name, u.email as admin_email
       FROM sa_audit_logs al
       LEFT JOIN users u ON al.admin_user_id = u.id
       ORDER BY al.created_at DESC LIMIT 100`,
    );
    return result.rows.map((r: any) => ({
      id: r.id, adminName: r.admin_name || r.admin_email || 'System',
      action: r.action, entityType: r.entity_type, entityId: r.entity_id,
      details: r.details, ipAddress: r.ip_address, createdAt: r.created_at,
    }));
  }
}
