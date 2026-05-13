import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { getCurrentTenantId } from '../common/tenant.context';

export interface AuditRecord {
  tenantId?: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string | null;
  module: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  httpMethod?: string | null;
  httpPath?: string | null;
  statusCode?: number | null;
  requestBody?: any;
  responseBody?: any;
  before?: any;
  after?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  durationMs?: number | null;
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  userId?: string;
  module?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly db: DatabaseService) {}

  async record(r: AuditRecord): Promise<void> {
    try {
      const tid = r.tenantId || safeTenantId();
      if (!tid) return; // pre-auth requests have no tenant — skip
      await this.db.query(
        `INSERT INTO audit_logs (
            tenant_id, user_id, user_email, user_name, user_role,
            module, action, entity_type, entity_id,
            http_method, http_path, status_code,
            request_body, response_body, before, after,
            ip_address, user_agent, duration_ms
         ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12,
            $13, $14, $15, $16,
            $17, $18, $19
         )`,
        [
          tid,
          r.userId || null,
          r.userEmail || null,
          r.userName || null,
          r.userRole || null,
          r.module,
          r.action,
          r.entityType || null,
          r.entityId || null,
          r.httpMethod || null,
          r.httpPath || null,
          r.statusCode || null,
          r.requestBody ? JSON.stringify(redact(r.requestBody)) : null,
          r.responseBody ? JSON.stringify(redact(r.responseBody)) : null,
          r.before ? JSON.stringify(r.before) : null,
          r.after ? JSON.stringify(r.after) : null,
          r.ipAddress || null,
          r.userAgent || null,
          r.durationMs ?? null,
        ],
      );
    } catch (err) {
      // Audit failures must never break user requests.
      this.logger.error('Audit insert failed', err as Error);
    }
  }

  async findAll(q: AuditQuery = {}) {
    const tid = getCurrentTenantId();
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(200, q.limit ?? 50);
    const offset = (page - 1) * limit;

    const where: string[] = ['tenant_id = $1'];
    const params: any[] = [tid];
    let p = 2;

    if (q.userId) { where.push(`user_id = $${p++}`); params.push(q.userId); }
    if (q.module) { where.push(`module = $${p++}`); params.push(q.module); }
    if (q.action) { where.push(`action = $${p++}`); params.push(q.action); }
    if (q.entityType) { where.push(`entity_type = $${p++}`); params.push(q.entityType); }
    if (q.entityId) { where.push(`entity_id = $${p++}`); params.push(q.entityId); }
    if (q.startDate) { where.push(`created_at >= $${p++}`); params.push(q.startDate); }
    if (q.endDate) { where.push(`created_at < $${p++}`); params.push(q.endDate); }
    if (q.search) {
      where.push(`(user_email ILIKE $${p} OR user_name ILIKE $${p} OR module ILIKE $${p} OR action ILIKE $${p} OR entity_id ILIKE $${p})`);
      params.push(`%${q.search}%`);
      p++;
    }

    const whereSql = where.join(' AND ');

    const [countRes, rowsRes] = await Promise.all([
      this.db.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM audit_logs WHERE ${whereSql}`, params),
      this.db.query(
        `SELECT * FROM audit_logs WHERE ${whereSql}
         ORDER BY created_at DESC
         LIMIT $${p} OFFSET $${p + 1}`,
        [...params, limit, offset],
      ),
    ]);

    const total = parseInt(countRes.rows[0]?.c ?? '0', 10);
    return {
      data: rowsRes.rows.map(mapRow),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const tid = getCurrentTenantId();
    const res = await this.db.query(
      `SELECT * FROM audit_logs WHERE id = $1 AND tenant_id = $2`,
      [id, tid],
    );
    return res.rows[0] ? mapRow(res.rows[0]) : null;
  }
}

function safeTenantId(): string | null {
  try {
    return getCurrentTenantId();
  } catch {
    return null;
  }
}

const SENSITIVE_KEYS = ['password', 'currentPassword', 'newPassword', 'tempPassword', 'temporaryPassword', 'passwordHash', 'access_token', 'refresh_token', 'accessToken', 'refreshToken', 'authorization'];

function redact(obj: any, depth = 0): any {
  if (depth > 4 || obj == null) return obj;
  if (Array.isArray(obj)) return obj.map((v) => redact(v, depth + 1));
  if (typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s.toLowerCase()))) {
        out[k] = '[redacted]';
      } else {
        out[k] = redact(v, depth + 1);
      }
    }
    return out;
  }
  return obj;
}

function mapRow(r: any) {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    userId: r.user_id,
    userEmail: r.user_email,
    userName: r.user_name,
    userRole: r.user_role,
    module: r.module,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    httpMethod: r.http_method,
    httpPath: r.http_path,
    statusCode: r.status_code,
    requestBody: r.request_body,
    responseBody: r.response_body,
    before: r.before,
    after: r.after,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    durationMs: r.duration_ms,
    createdAt: r.created_at,
  };
}
