import {
  Injectable,
  CanActivate,
  HttpException,
  HttpStatus,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Observable } from 'rxjs';

import { getAccessTokenFromRequest } from '../helpers';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    return !!this.verifyAccessToken(getAccessTokenFromRequest(request));
  }

  verifyAccessToken(accessToken: string) {
    try {
      return this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_SECRET')
      });
    } catch (error) {
      throw new HttpException('Authorization token expired', HttpStatus.UNAUTHORIZED);
    }
  }
}
