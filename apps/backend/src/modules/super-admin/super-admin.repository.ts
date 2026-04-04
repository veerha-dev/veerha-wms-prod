import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminRepository {
  constructor(private db: DatabaseService) {}

  // ─── Tenant Methods ────────────────────────────────────────────────

  async getAllTenants() {
    const result = await this.db.query(`
      SELECT
        t.id,
        t.slug,
        t.company_name,
        t.admin_email,
        t.phone,
        t.address,
        t.city,
        t.country,
        t.gst_number,
        t.status,
        t.plan_id,
        t.billing_cycle,
        t.trial_ends_at,
        t.suspended_at,
        t.max_warehouses,
        t.max_skus,
        t.max_users,
        t.max_managers,
        t.max_workers,
        t.max_daily_movements,
        t.max_batches,
        t.report_retention_days,
        t.enabled_modules,
        t.created_at,
        t.updated_at,
        p.name AS plan_name,
        p.code AS plan_code,
        (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) AS user_count,
        (SELECT COUNT(*) FROM skus s WHERE s.tenant_id = t.id) AS sku_count,
        (SELECT COUNT(*) FROM warehouses w WHERE w.tenant_id = t.id) AS warehouse_count
      FROM tenants t
      LEFT JOIN plans p ON p.id = t.plan_id
      WHERE t.id != '00000000-0000-0000-0000-000000000001'
      ORDER BY t.created_at DESC
    `);

    return result.rows.map((row) => this.mapTenantRow(row));
  }

  async getTenantById(id: string) {
    const result = await this.db.query(
      `
      SELECT
        t.*,
        p.name AS plan_name,
        p.code AS plan_code,
        p.monthly_price AS plan_monthly_price,
        p.yearly_price AS plan_yearly_price,
        (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) AS user_count,
        (SELECT COUNT(*) FROM skus s WHERE s.tenant_id = t.id) AS sku_count,
        (SELECT COUNT(*) FROM warehouses w WHERE w.tenant_id = t.id) AS warehouse_count
      FROM tenants t
      LEFT JOIN plans p ON p.id = t.plan_id
      WHERE t.id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.mapTenantRow(result.rows[0]);
  }

  async createTenant(data: {
    slug: string;
    companyName: string;
    adminEmail: string;
    adminPasswordHash: string;
    adminName: string;
    planCode?: string;
    billingCycle?: string;
    discountPercent?: number;
    notes?: string;
  }) {
    // Using sequential queries (transaction pattern had issues with pg client)
      // 1. Resolve plan
      let planId: string | null = null;
      let planRow: any = null;

      if (data.planCode) {
        const planResult = await this.db.query(
          'SELECT * FROM plans WHERE code = $1 AND is_active = true',
          [data.planCode],
        );
        if (planResult.rows.length > 0) {
          planRow = planResult.rows[0];
          planId = planRow.id;
        }
      }

      // 2. Insert tenant
      const tenantResult = await this.db.query(
        `INSERT INTO tenants (
          name, slug, company_name, admin_email, status, plan_id, billing_cycle,
          max_warehouses, max_skus, max_users, max_managers, max_workers,
          max_daily_movements, max_batches, report_retention_days, enabled_modules
        ) VALUES (
          $1, $2, $3, $4, 'active', $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15
        ) RETURNING *`,
        [
          data.companyName,
          data.slug,
          data.companyName,
          data.adminEmail,
          planId,
          data.billingCycle || 'monthly',
          planRow?.max_warehouses || 1,
          planRow?.max_skus || 100,
          planRow?.max_users || 5,
          planRow?.max_managers || 1,
          planRow?.max_workers || 5,
          planRow?.max_daily_movements || 100,
          planRow?.max_batches || 50,
          planRow?.report_retention_days || 30,
          planRow?.enabled_modules || [],
        ],
      );

      const tenant = tenantResult.rows[0];

      // 3. Insert admin user
      const userResult = await this.db.query(
        `INSERT INTO users (
          tenant_id, email, password_hash, full_name, role, is_active, is_super_admin
        ) VALUES ($1, $2, $3, $4, 'admin', true, false)
        RETURNING id, email, full_name as name, role`,
        [tenant.id, data.adminEmail, data.adminPasswordHash, data.adminName],
      );

      const adminUser = userResult.rows[0];

      // 4. Create subscription if plan exists
      let subscription = null;
      if (planRow) {
        const billingCycle = data.billingCycle || 'monthly';
        const baseAmount =
          billingCycle === 'yearly'
            ? parseFloat(planRow.yearly_price)
            : parseFloat(planRow.monthly_price);
        const discountPercent = data.discountPercent || 0;
        const discountAmount = (baseAmount * discountPercent) / 100;
        const finalAmount = baseAmount - discountAmount;

        const subResult = await this.db.query(
          `INSERT INTO subscriptions (
            tenant_id, plan_id, status, billing_cycle,
            base_amount, discount_percent, discount_amount, final_amount,
            next_billing_date, started_at, notes
          ) VALUES (
            $1, $2, 'active', $3,
            $4, $5, $6, $7,
            NOW() + INTERVAL '1 month', NOW(), $8
          ) RETURNING *`,
          [
            tenant.id,
            planId,
            billingCycle,
            baseAmount,
            discountPercent,
            discountAmount,
            finalAmount,
            data.notes || null,
          ],
        );
        subscription = this.mapSubscriptionRow(subResult.rows[0]);
      }

      // 5. Seed role_permissions from the default tenant
      await this.db.query(
        `INSERT INTO role_permissions (tenant_id, role, module, action, allowed)
         SELECT $1, role, module, action, allowed
         FROM role_permissions
         WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
         ON CONFLICT DO NOTHING`,
        [tenant.id],
      );

      return {
        tenant: this.mapTenantRow(tenant),
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        },
        subscription,
      };
  }

  async updateTenant(
    id: string,
    data: {
      companyName?: string;
      adminEmail?: string;
      phone?: string;
      address?: string;
      city?: string;
      country?: string;
      gstNumber?: string;
      planId?: string;
      billingCycle?: string;
      maxWarehouses?: number;
      maxSkus?: number;
      maxUsers?: number;
      maxManagers?: number;
      maxWorkers?: number;
      maxDailyMovements?: number;
      maxBatches?: number;
      reportRetentionDays?: number;
      enabledModules?: string[];
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      companyName: 'company_name',
      adminEmail: 'admin_email',
      phone: 'phone',
      address: 'address',
      city: 'city',
      country: 'country',
      gstNumber: 'gst_number',
      planId: 'plan_id',
      billingCycle: 'billing_cycle',
      maxWarehouses: 'max_warehouses',
      maxSkus: 'max_skus',
      maxUsers: 'max_users',
      maxManagers: 'max_managers',
      maxWorkers: 'max_workers',
      maxDailyMovements: 'max_daily_movements',
      maxBatches: 'max_batches',
      reportRetentionDays: 'report_retention_days',
      enabledModules: 'enabled_modules',
    };

    const dataAny = data as any;
    for (const [camelKey, dbKey] of Object.entries(fieldMap)) {
      if (dataAny[camelKey] !== undefined) {
        fields.push(`${dbKey} = $${paramIndex}`);
        values.push(dataAny[camelKey]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return this.getTenantById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await this.db.query(
      `UPDATE tenants SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) return null;
    return this.mapTenantRow(result.rows[0]);
  }

  async suspendTenant(id: string) {
    const result = await this.db.query(
      `UPDATE tenants SET status = 'suspended', suspended_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapTenantRow(result.rows[0]);
  }

  async activateTenant(id: string) {
    const result = await this.db.query(
      `UPDATE tenants SET status = 'active', suspended_at = NULL, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapTenantRow(result.rows[0]);
  }

  async deleteTenant(id: string) {
    // Delete users belonging to this tenant first (no FK cascade in schema)
    await this.db.query('DELETE FROM users WHERE tenant_id = $1', [id]);
    // Delete subscriptions
    await this.db.query('DELETE FROM subscriptions WHERE tenant_id = $1', [id]);
    const result = await this.db.query('DELETE FROM tenants WHERE id = $1 RETURNING id', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Plan Methods ──────────────────────────────────────────────────

  async getAllPlans() {
    const result = await this.db.query(
      'SELECT * FROM plans ORDER BY sort_order ASC, created_at ASC',
    );
    return result.rows.map((row) => this.mapPlanRow(row));
  }

  async createPlan(data: {
    name: string;
    code: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    maxWarehouses: number;
    maxSkus: number;
    maxUsers: number;
    maxManagers: number;
    maxWorkers: number;
    maxDailyMovements: number;
    maxBatches: number;
    reportRetentionDays: number;
    enabledModules?: string[];
    sortOrder?: number;
  }) {
    const result = await this.db.query(
      `INSERT INTO plans (
        name, code, description, monthly_price, yearly_price,
        max_warehouses, max_skus, max_users, max_managers, max_workers,
        max_daily_movements, max_batches, report_retention_days,
        enabled_modules, is_active, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, $15)
      RETURNING *`,
      [
        data.name,
        data.code,
        data.description || null,
        data.monthlyPrice,
        data.yearlyPrice,
        data.maxWarehouses,
        data.maxSkus,
        data.maxUsers,
        data.maxManagers,
        data.maxWorkers,
        data.maxDailyMovements,
        data.maxBatches,
        data.reportRetentionDays,
        data.enabledModules || '{}',
        data.sortOrder || 0,
      ],
    );

    return this.mapPlanRow(result.rows[0]);
  }

  async updatePlan(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      monthlyPrice?: number;
      yearlyPrice?: number;
      maxWarehouses?: number;
      maxSkus?: number;
      maxUsers?: number;
      maxManagers?: number;
      maxWorkers?: number;
      maxDailyMovements?: number;
      maxBatches?: number;
      reportRetentionDays?: number;
      enabledModules?: string[];
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      code: 'code',
      description: 'description',
      monthlyPrice: 'monthly_price',
      yearlyPrice: 'yearly_price',
      maxWarehouses: 'max_warehouses',
      maxSkus: 'max_skus',
      maxUsers: 'max_users',
      maxManagers: 'max_managers',
      maxWorkers: 'max_workers',
      maxDailyMovements: 'max_daily_movements',
      maxBatches: 'max_batches',
      reportRetentionDays: 'report_retention_days',
      enabledModules: 'enabled_modules',
      isActive: 'is_active',
      sortOrder: 'sort_order',
    };

    const dataAny = data as any;
    for (const [camelKey, dbKey] of Object.entries(fieldMap)) {
      if (dataAny[camelKey] !== undefined) {
        fields.push(`${dbKey} = $${paramIndex}`);
        values.push(dataAny[camelKey]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await this.db.query(
      `UPDATE plans SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) return null;
    return this.mapPlanRow(result.rows[0]);
  }

  // ─── Dashboard & Usage ─────────────────────────────────────────────

  async getDashboardStats() {
    const result = await this.db.query(`
      SELECT
        (SELECT COUNT(*) FROM tenants) AS total_tenants,
        (SELECT COUNT(*) FROM tenants WHERE status = 'active') AS active_tenants,
        (SELECT COUNT(*) FROM tenants WHERE status = 'suspended') AS suspended_tenants,
        (SELECT COUNT(*) FROM tenants WHERE trial_ends_at IS NOT NULL AND trial_ends_at > NOW()) AS trial_tenants,
        (SELECT COALESCE(SUM(final_amount), 0) FROM subscriptions WHERE status = 'active' AND billing_cycle = 'monthly') AS monthly_recurring_revenue,
        (SELECT COALESCE(SUM(final_amount / 12), 0) FROM subscriptions WHERE status = 'active' AND billing_cycle = 'yearly') AS yearly_to_monthly_revenue,
        (SELECT COALESCE(SUM(total), 0) FROM billing_invoices WHERE status = 'paid') AS total_revenue,
        (SELECT COUNT(*) FROM billing_invoices WHERE status = 'pending') AS pending_invoices,
        (SELECT COUNT(*) FROM users) AS total_users
    `);

    const row = result.rows[0];
    const mrr =
      parseFloat(row.monthly_recurring_revenue) +
      parseFloat(row.yearly_to_monthly_revenue);

    return {
      totalTenants: parseInt(row.total_tenants, 10),
      activeTenants: parseInt(row.active_tenants, 10),
      suspendedTenants: parseInt(row.suspended_tenants, 10),
      trialTenants: parseInt(row.trial_tenants, 10),
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(mrr * 12 * 100) / 100,
      totalRevenue: parseFloat(row.total_revenue),
      pendingInvoices: parseInt(row.pending_invoices, 10),
      totalUsers: parseInt(row.total_users, 10),
    };
  }

  async getUsageForTenant(tenantId: string) {
    const result = await this.db.query(
      `
      SELECT
        (SELECT COUNT(*) FROM skus WHERE tenant_id = $1) AS sku_count,
        (SELECT COUNT(*) FROM warehouses WHERE tenant_id = $1) AS warehouse_count,
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS user_count,
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'manager') AS manager_count,
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'worker') AS worker_count,
        (SELECT COUNT(*) FROM batches WHERE tenant_id = $1) AS batch_count
    `,
      [tenantId],
    );

    const row = result.rows[0];
    return {
      skuCount: parseInt(row.sku_count, 10),
      warehouseCount: parseInt(row.warehouse_count, 10),
      userCount: parseInt(row.user_count, 10),
      managerCount: parseInt(row.manager_count, 10),
      workerCount: parseInt(row.worker_count, 10),
      batchCount: parseInt(row.batch_count, 10),
    };
  }

  // ─── Billing / Invoice Methods ─────────────────────────────────────

  async getAllInvoices() {
    const result = await this.db.query(`
      SELECT
        bi.*,
        t.company_name AS tenant_name,
        t.slug AS tenant_slug
      FROM billing_invoices bi
      LEFT JOIN tenants t ON t.id = bi.tenant_id
      ORDER BY bi.created_at DESC
    `);

    return result.rows.map((row) => this.mapInvoiceRow(row));
  }

  async createInvoice(data: {
    tenantId: string;
    subscriptionId?: string;
    invoiceNumber: string;
    amount: number;
    discount?: number;
    taxAmount?: number;
    total: number;
    status?: string;
    dueDate: string;
    paymentMethod?: string;
    periodStart: string;
    periodEnd: string;
    notes?: string;
  }) {
    const result = await this.db.query(
      `INSERT INTO billing_invoices (
        tenant_id, subscription_id, invoice_number, amount, discount,
        tax_amount, total, status, due_date, payment_method,
        period_start, period_end, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        data.tenantId,
        data.subscriptionId || null,
        data.invoiceNumber,
        data.amount,
        data.discount || 0,
        data.taxAmount || 0,
        data.total,
        data.status || 'pending',
        data.dueDate,
        data.paymentMethod || null,
        data.periodStart,
        data.periodEnd,
        data.notes || null,
      ],
    );

    return this.mapInvoiceRow(result.rows[0]);
  }

  async markInvoicePaid(id: string) {
    const result = await this.db.query(
      `UPDATE billing_invoices
       SET status = 'paid', paid_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.mapInvoiceRow(result.rows[0]);
  }

  // ─── Auth Helper ───────────────────────────────────────────────────

  async findSuperAdminByEmail(email: string) {
    const result = await this.db.query(
      `SELECT id, email, full_name as name, password_hash, is_super_admin
       FROM users WHERE email = $1 AND is_super_admin = true`,
      [email],
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      isSuperAdmin: row.is_super_admin,
    };
  }

  // ─── Row Mappers ───────────────────────────────────────────────────

  private mapTenantRow(row: any) {
    return {
      id: row.id,
      slug: row.slug,
      companyName: row.company_name,
      adminEmail: row.admin_email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      country: row.country,
      gstNumber: row.gst_number,
      status: row.status,
      planId: row.plan_id,
      billingCycle: row.billing_cycle,
      trialEndsAt: row.trial_ends_at,
      suspendedAt: row.suspended_at,
      maxWarehouses: row.max_warehouses,
      maxSkus: row.max_skus,
      maxUsers: row.max_users,
      maxManagers: row.max_managers,
      maxWorkers: row.max_workers,
      maxDailyMovements: row.max_daily_movements,
      maxBatches: row.max_batches,
      reportRetentionDays: row.report_retention_days,
      enabledModules: row.enabled_modules,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Joined fields (may be undefined)
      planName: row.plan_name,
      planCode: row.plan_code,
      planMonthlyPrice: row.plan_monthly_price != null ? parseFloat(row.plan_monthly_price) : undefined,
      planYearlyPrice: row.plan_yearly_price != null ? parseFloat(row.plan_yearly_price) : undefined,
      userCount: row.user_count != null ? parseInt(row.user_count, 10) : undefined,
      skuCount: row.sku_count != null ? parseInt(row.sku_count, 10) : undefined,
      warehouseCount: row.warehouse_count != null ? parseInt(row.warehouse_count, 10) : undefined,
    };
  }

  private mapPlanRow(row: any) {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      monthlyPrice: parseFloat(row.monthly_price),
      yearlyPrice: parseFloat(row.yearly_price),
      maxWarehouses: row.max_warehouses,
      maxSkus: row.max_skus,
      maxUsers: row.max_users,
      maxManagers: row.max_managers,
      maxWorkers: row.max_workers,
      maxDailyMovements: row.max_daily_movements,
      maxBatches: row.max_batches,
      reportRetentionDays: row.report_retention_days,
      enabledModules: row.enabled_modules,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapSubscriptionRow(row: any) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      planId: row.plan_id,
      status: row.status,
      billingCycle: row.billing_cycle,
      baseAmount: parseFloat(row.base_amount),
      discountPercent: parseFloat(row.discount_percent),
      discountAmount: parseFloat(row.discount_amount),
      finalAmount: parseFloat(row.final_amount),
      nextBillingDate: row.next_billing_date,
      startedAt: row.started_at,
      cancelledAt: row.cancelled_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapInvoiceRow(row: any) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      subscriptionId: row.subscription_id,
      invoiceNumber: row.invoice_number,
      amount: parseFloat(row.amount),
      discount: parseFloat(row.discount),
      taxAmount: parseFloat(row.tax_amount),
      total: parseFloat(row.total),
      status: row.status,
      dueDate: row.due_date,
      paidAt: row.paid_at,
      paymentMethod: row.payment_method,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Joined fields
      tenantName: row.tenant_name,
      tenantSlug: row.tenant_slug,
    };
  }
}
