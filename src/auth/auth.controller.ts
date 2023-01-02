import { Post, Body, Controller } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthProvider } from '../constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/google')
  async authenticateWithGoogle(@Body('token') token: string) {
    return this.authService.authenticate(token, AuthProvider.Google);
  }

  @Post()
  async authenticate(@Body('token') token: string) {
    return this.authService.authenticate(token);
  }
}
