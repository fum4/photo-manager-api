import { Post, Body, Controller, Req, type Request } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthProvider } from '../constants';
import { getAccessTokenFromRequest } from '../helpers';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/google')
  async authenticateWithGoogle(@Body('idToken') idToken: string) {
    return this.authService.login(idToken, AuthProvider.Google);
  }

  @Post('/jwt')
  async silentLogin(@Req() request: Request) {
    const accessToken = getAccessTokenFromRequest(request);
    return this.authService.silentLogin(accessToken);
  }

  @Post('/logout')
  async logout(@Req() request: Request) {
    const accessToken = getAccessTokenFromRequest(request);
    return this.authService.logout(accessToken);
  }

  @Post('/refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Body('refreshToken') refreshToken: string
  ) {
    const accessToken = getAccessTokenFromRequest(request);
    return this.authService.refreshToken(accessToken, refreshToken);
  }
}
