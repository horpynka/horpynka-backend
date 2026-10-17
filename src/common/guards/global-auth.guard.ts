import { FastifyRequest } from 'fastify';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_ROLES } from '../types/auth';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<AUTH_ROLES[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return this.validateJwt(context, requiredRoles);
  }

  private extractAccessToken(request: FastifyRequest): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }

  private async validateJwt(
    context: ExecutionContext,
    requiredRoles: AUTH_ROLES[],
  ) {
    const request: FastifyRequest = context.switchToHttp().getRequest();

    const accessToken = this.extractAccessToken(request);

    try {
      const decodedAccessToken = await this.authService.asyncVerifyToken<{
        roles: AUTH_ROLES[];
      }>(accessToken);
      if (!decodedAccessToken) {
        throw new UnauthorizedException();
      }

      const userRoles = Array.isArray(decodedAccessToken.roles)
        ? decodedAccessToken.roles
        : [];
      const hasPermission = requiredRoles.some((role) =>
        userRoles.includes(role),
      );

      if (!hasPermission) {
        throw new ForbiddenException();
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new UnauthorizedException();
    }
    return true;
  }
}
