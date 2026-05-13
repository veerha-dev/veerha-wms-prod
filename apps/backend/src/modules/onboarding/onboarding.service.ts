import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { getCurrentTenantId } from '../common/tenant.context';

export interface OnboardingStatus {
  tenantId: string;
  onboardingCompletedAt: string | null;
  hasWarehouse: boolean;
  hasLayout: boolean;
  hasSkus: boolean;
  hasSuppliers: boolean;
  hasInvitedUsers: boolean;
  counts: {
    warehouses: number;
    zones: number;
    skus: number;
    suppliers: number;
    invitedUsers: number;
  };
}

@Injectable()
export class OnboardingService {
  constructor(private readonly db: DatabaseService) {}

  async getStatus(): Promise<OnboardingStatus> {
    const tid = getCurrentTenantId();

    const [
      tenantRes,
      whRes,
      zoneRes,
      skuRes,
      supRes,
      userRes,
    ] = await Promise.all([
      this.db.query<{ onboarding_completed_at: string | null }>(
        `SELECT onboarding_completed_at FROM tenants WHERE id = $1`,
        [tid],
      ),
      this.db.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM warehouses WHERE tenant_id = $1`,
        [tid],
      ),
      this.db.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM zones WHERE tenant_id = $1`,
        [tid],
      ),
      this.db.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM skus WHERE tenant_id = $1`,
        [tid],
      ),
      this.db.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM suppliers WHERE tenant_id = $1`,
        [tid],
      ),
      this.db.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM users WHERE tenant_id = $1 AND role IN ('manager','worker')`,
        [tid],
      ),
    ]);

    const counts = {
      warehouses: parseInt(whRes.rows[0]?.c ?? '0', 10),
      zones: parseInt(zoneRes.rows[0]?.c ?? '0', 10),
      skus: parseInt(skuRes.rows[0]?.c ?? '0', 10),
      suppliers: parseInt(supRes.rows[0]?.c ?? '0', 10),
      invitedUsers: parseInt(userRes.rows[0]?.c ?? '0', 10),
    };

    return {
      tenantId: tid,
      onboardingCompletedAt: tenantRes.rows[0]?.onboarding_completed_at ?? null,
      hasWarehouse: counts.warehouses > 0,
      hasLayout: counts.zones > 0,
      hasSkus: counts.skus > 0,
      hasSuppliers: counts.suppliers > 0,
      hasInvitedUsers: counts.invitedUsers > 0,
      counts,
    };
  }

  async markComplete() {
    const tid = getCurrentTenantId();
    await this.db.query(
      `UPDATE tenants SET onboarding_completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [tid],
    );
    return this.getStatus();
  }

  async reset() {
    const tid = getCurrentTenantId();
    await this.db.query(
      `UPDATE tenants SET onboarding_completed_at = NULL, updated_at = NOW() WHERE id = $1`,
      [tid],
    );
    return this.getStatus();
  }
}
