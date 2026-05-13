import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuditService } from './audit.service';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Path → audit module name. We derive the module from /api/v1/<module>/...
// Falls back to the second segment when there's no match.
function moduleFromPath(path: string): string {
  const m = path.match(/^\/?api\/v1\/([^\/?]+)/);
  return m ? m[1] : 'unknown';
}

function actionFromMethodAndPath(method: string, path: string): string {
  // Specific actions take priority — these are the workflow-meaningful ones the audit log should
  // highlight independently of the underlying HTTP verb.
  if (/\/approve(\?|$|\/)/i.test(path)) return 'approve';
  if (/\/reject(\?|$|\/)/i.test(path)) return 'reject';
  if (/\/complete(\?|$|\/)/i.test(path)) return 'complete';
  if (/\/cancel(\?|$|\/)/i.test(path)) return 'cancel';
  if (/\/dispatch(\?|$|\/)/i.test(path)) return 'dispatch';
  if (/\/assign(\-bin|\?|$|\/)/i.test(path)) return 'assign';
  if (/\/invite(\?|$|\/)/i.test(path)) return 'invite';
  if (/\/force-logout(\?|$|\/)/i.test(path)) return 'force_logout';
  if (/\/reset-password(\?|$|\/)/i.test(path)) return 'reset_password';
  if (/\/login(\?|$|\/)/i.test(path)) return 'login';
  if (/\/signup(\?|$|\/)/i.test(path)) return 'signup';

  switch (method) {
    case 'POST': return 'create';
    case 'PUT': return 'update';
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return method.toLowerCase();
  }
}

function entityIdFromPath(path: string): string | null {
  // Pull the last path segment that looks like a UUID or id-like token
  const segs = path.split('?')[0].split('/').filter(Boolean);
  const last = segs[segs.length - 1];
  if (!last) return null;
  // UUID v4-ish
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(last)) return last;
  // Numeric id
  if (/^\d+$/.test(last)) return last;
  return null;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http = ctx.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const method: string = (req?.method || '').toUpperCase();
    const path: string = req?.originalUrl || req?.url || '';

    // Skip read traffic — too noisy and provides little compliance value
    if (!MUTATION_METHODS.has(method)) return next.handle();

    // Skip non-API paths
    if (!path.startsWith('/api/v1/')) return next.handle();

    const start = Date.now();
    const moduleName = moduleFromPath(path);
    const action = actionFromMethodAndPath(method, path);
    const entityIdFromUrl = entityIdFromPath(path);

    const user = req?.user;
    const meta = {
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      userName: user?.fullName ?? null,
      userRole: user?.role ?? null,
      ipAddress: (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      userAgent: req.headers?.['user-agent'] || null,
      httpMethod: method,
      httpPath: path,
      requestBody: req.body,
    };

    return next.handle().pipe(
      tap((data) => {
        const durationMs = Date.now() - start;
        const responseBody = data;
        const entityId =
          entityIdFromUrl ||
          (responseBody?.data?.id ?? responseBody?.id ?? null);

        // fire-and-forget — never await audit writes from the request path
        void this.audit.record({
          ...meta,
          statusCode: res?.statusCode ?? 200,
          module: moduleName,
          action,
          entityType: moduleName,
          entityId,
          responseBody,
          durationMs,
        });
      }),
      catchError((err) => {
        const durationMs = Date.now() - start;
        void this.audit.record({
          ...meta,
          statusCode: err?.status ?? 500,
          module: moduleName,
          action,
          entityType: moduleName,
          entityId: entityIdFromUrl,
          responseBody: { error: err?.message ?? 'error' },
          durationMs,
        });
        return throwError(() => err);
      }),
    );
  }
}
