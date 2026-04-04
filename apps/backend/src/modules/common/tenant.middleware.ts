import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { runWithTenant, DEFAULT_TENANT_ID } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: any, res: any, next: () => void) {
    let tenantId = DEFAULT_TENANT_ID;

    try {
      const authHeader = req.headers?.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const secret = this.configService.get<string>('JWT_SECRET') || 'veerha-wms-dev-jwt-secret-change-in-production-min-32-chars';
        const payload = jwt.verify(token, secret) as any;
        if (payload?.tenantId) {
          tenantId = payload.tenantId;
        }
      }
    } catch {
      // Token invalid/expired — use default tenant
    }

    runWithTenant(tenantId, () => next());
  }
}
