import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    let payload: any;
    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET');
      payload = this.jwtService.verify(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const result = await this.db.query(
      'SELECT id, email, full_name, is_super_admin FROM users WHERE id = $1',
      [payload.sub],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const user = result.rows[0];

    if (!user.is_super_admin) {
      throw new ForbiddenException('Super admin access required');
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.full_name,
      isSuperAdmin: true,
    };

    return true;
  }
}
