import { jwtSecret } from '../../auth/jwt-secret.js';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
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
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

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
          secret: jwtSecret(),
        });
        const user = payload?.sub ? await this.prisma.user.findUnique({where:{id:payload.sub}}) : null;
        if (user?.isActive && ['HR', 'MANAGER'].includes(user.role)) {
          request.user = {id:user.id, role:user.role};
          return true;
        }
      } catch {
        // Token verification failed, continue to throw
      }
    }

    throw new UnauthorizedException('Access denied. HR JWT or valid x-api-key required.');
  }
}
