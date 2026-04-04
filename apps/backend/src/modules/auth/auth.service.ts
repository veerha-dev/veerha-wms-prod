import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class AuthService {
  constructor(
    private repository: AuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.repository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.repository.createUser(
      dto.email,
      dto.fullName,
      passwordHash,
      'admin',
      DEFAULT_TENANT_ID,
    );

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id,
        isActive: true,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.repository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Account not set up for password login');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.repository.updateLastLogin(user.id);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id,
        isActive: user.is_active,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      tenantId: user.tenant_id,
      isActive: user.is_active,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.repository.findUserById(payload.sub);
      if (!user || !user.is_active) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.repository.findUserWithHashById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    if (!user.password_hash) throw new BadRequestException('Account does not use password login');

    const valid = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    if (dto.newPassword.length < 8) throw new BadRequestException('New password must be at least 8 characters');

    const hash = await bcrypt.hash(dto.newPassword, 12);
    await this.repository.updatePasswordHash(userId, hash);
    return { message: 'Password updated successfully' };
  }

  private async generateTokens(payload: { sub: string; email: string; role: string; tenantId: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: '24h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
