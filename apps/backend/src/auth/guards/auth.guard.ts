import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ENV } from '../../config/env.config';

interface JWTPayload {
  sub: string;
  email: string;
  role: 'patient' | 'admin';
}

abstract class BaseJwtGuard implements CanActivate {
  constructor(protected readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(token, {
        secret: ENV.JWT_ACCESS_SECRET,
      });
      
      // Inject decoded payload back to Express request user
      request['user'] = payload;
      
      return this.validateRole(payload.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  protected abstract validateRole(role: string): boolean;

  private extractTokenFromHeader(request: Request): string | null {
    // Try Authorization header first
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;
    // Fallback: read from httpOnly cookie (set by backend on admin/patient login)
    return (request as any).cookies?.accessToken ?? null;
  }
}

@Injectable()
export class PatientGuard extends BaseJwtGuard {
  constructor(jwtService: JwtService) {
    super(jwtService);
  }

  protected validateRole(role: string): boolean {
    if (role !== 'patient') {
      throw new UnauthorizedException('Access restricted to patients only');
    }
    return true;
  }
}

@Injectable()
export class AdminGuard extends BaseJwtGuard {
  constructor(jwtService: JwtService) {
    super(jwtService);
  }

  protected validateRole(role: string): boolean {
    if (role !== 'admin') {
      throw new UnauthorizedException('Access restricted to admins only');
    }
    return true;
  }
}

@Injectable()
export class AuthenticatedGuard extends BaseJwtGuard {
  constructor(jwtService: JwtService) {
    super(jwtService);
  }

  protected validateRole(role: string): boolean {
    if (role !== 'patient' && role !== 'admin') {
      throw new UnauthorizedException('Unauthorized role profile');
    }
    return true;
  }
}
