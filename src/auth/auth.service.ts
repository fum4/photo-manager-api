import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';

import { UserService } from '../users/user.service';
import { User, UserDocument } from '../users/user.schema';
import { AuthProvider } from '../constants';

const googleOauthClient = new OAuth2Client();

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async authenticate(token: string, provider?: AuthProvider) {
    const { userId } = this.jwtService.decode(token) as { userId: string };

    if (userId) {
      const user = await this.userService.getById(userId);

      return this.handleRegisteredUser(user);
    }

    const { name, email } = await this.getUserData(token, provider);

    try {
      const user = await this.userService.getByEmail(email);

      return this.handleRegisteredUser(user);
    } catch (error) {
      if (error.status !== HttpStatus.NOT_FOUND) {
        throw new error;
      }

      return this.register(name, email);
    }
  }

  async register(name: string, email: string) {
    const user = await this.userService.create(name, email);

    return this.handleRegisteredUser(user);
  }

  async handleRegisteredUser(user: User) {
    const { accessToken, refreshToken } = await this.getSessionTokens(user);

    return {
      userId: user._id,
      username: user.name,
      accessToken,
      refreshToken
    }
  }

  async getUserData(token: string, provider: AuthProvider) {
    switch(provider) {
      case AuthProvider.Google: {
        const ticket = await googleOauthClient.verifyIdToken({
          audience: this.configService.get('GOOGLE_CLIENT_ID'),
          idToken: token
        });

        return ticket.getPayload();
      }
    }
  };

  async getSessionTokens(user: User) {
    const accessToken = this.jwtService.sign({ userId: user._id }, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
    });

    const refreshToken = this.jwtService.sign({ userId: user._id }, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`
    });

    return {
      accessToken,
      refreshToken
    };
  }
}
