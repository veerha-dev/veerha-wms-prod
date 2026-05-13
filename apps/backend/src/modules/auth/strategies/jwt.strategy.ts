import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../../database/database.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  warehouseId?: string | null;
  tokenVersion?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Reject tokens issued before the current token_version (force-logout / password reset).
    const tokenVersion = payload.tokenVersion ?? 0;
    const res = await this.db.query<{
      token_version: number;
      is_active: boolean;
      full_name: string;
    }>(
      `SELECT token_version, is_active, full_name FROM users WHERE id = $1`,
      [payload.sub],
    );
    const row = res.rows[0];
    if (!row) throw new UnauthorizedException('User no longer exists');
    if (!row.is_active) throw new UnauthorizedException('Account is deactivated');
    if ((row.token_version ?? 0) > tokenVersion) {
      throw new UnauthorizedException('Session terminated. Please log in again.');
    }

    return {
      id: payload.sub,
      email: payload.email,
      fullName: row.full_name,
      role: payload.role,
      tenantId: payload.tenantId,
      warehouseId: payload.warehouseId ?? null,
    };
  }
}
