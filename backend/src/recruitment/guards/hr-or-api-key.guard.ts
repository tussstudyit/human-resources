import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

@Injectable()
export class HrOrApiKeyGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Check x-api-key header first
    const apiKey = request.headers['x-api-key'];
    const expectedApiKey = process.env.N8N_API_KEY;

    if (expectedApiKey && typeof apiKey === 'string' && safeCompare(apiKey, expectedApiKey)) {
      return true;
    }

    // 2. Check JWT Bearer token
    const authHeader = request.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'hr_jwt_secret_super_key_2026_antigravity',
        });
        if (payload && payload.role === 'HR') {
          request.user = payload;
          return true;
        }
      } catch {
        // Token verification failed, continue to throw
      }
    }

    throw new UnauthorizedException('Access denied. HR JWT or valid x-api-key required.');
  }
}
