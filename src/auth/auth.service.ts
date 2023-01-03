import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../users/user.service';
import { User, type UserDocument } from '../users/user.schema';
import { AuthProvider } from '../constants';

export interface AccessTokenPayload extends OAuthTokenPayload {
  userId: string;
  exp: number;
  iat: number;
  permissions?: number[];
  roles?: number[];
}

interface OAuthTokenPayload {
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {
    this.googleOauthClient = new OAuth2Client(
      configService.get('GOOGLE_CLIENT_ID'),
      configService.get('GOOGLE_CLIENT_SECRET')
    );
  }

  googleOauthClient;

  async silentLogin(accessToken: string) {
    const tokenPayload = this.verifyAccessToken(accessToken);
    await this.userService.getByEmail(tokenPayload.email);

    return { accessToken: this.getAccessToken(tokenPayload) };
  }

  async login(token: string, provider: AuthProvider) {
    const tokenPayload = await this.verifyIdToken(token, provider);

    try {
      const { _id: userId } = await this.userService.getByEmail(tokenPayload.email);
      const refreshToken = uuidv4();
      const accessToken = this.getAccessToken({ ...tokenPayload, userId });

      await this.userService.saveRefreshTokenHash(userId, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
       return this.register(tokenPayload as Omit<AccessTokenPayload, 'userId'>);
      }

      throw error;
    }
  }

  async register(tokenPayload: Omit<AccessTokenPayload, 'userId'>) {
    const { _id: userId } = await this.userService.create(tokenPayload.name, tokenPayload.email);
    const refreshToken = uuidv4();
    const accessToken = this.getAccessToken(tokenPayload);
    await this.userService.saveRefreshTokenHash(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(accessToken: string) {
    const { userId } = this.jwtService.decode(accessToken) as AccessTokenPayload;
    await this.userService.saveRefreshTokenHash(userId, null)
  }

  async refreshToken(accessToken: string, refreshToken: string) {
    const tokenPayload = this.jwtService.decode(accessToken) as AccessTokenPayload;

    if (tokenPayload) {
      const { _id: userId } = await this.userService.getUserIfRefreshTokenMatches(tokenPayload.userId, refreshToken);

      if (userId) {
        const refreshToken = uuidv4();
        const accessToken = this.getAccessToken(tokenPayload);
        await this.userService.saveRefreshTokenHash(userId, refreshToken);

        return { accessToken, refreshToken };
      }
    } else {
      throw new HttpException('Bad token request', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyIdToken(idToken: string, provider: AuthProvider): Promise<OAuthTokenPayload> {
    try {
      switch(provider) {
        case AuthProvider.Google: {
          const ticket = await this.googleOauthClient.verifyIdToken({
            idToken,
            audience: this.configService.get('GOOGLE_CLIENT_ID')
          });

          const { name, email } = ticket.getPayload();

          return { name, email };
        }
      }
    } catch (error) {
      throw new HttpException('idToken not valid', HttpStatus.UNAUTHORIZED);
    }
  };

  verifyAccessToken(accessToken: string) {
    try {
      return this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_SECRET')
      });
    } catch (error) {
      throw new HttpException('Authorization token expired', HttpStatus.UNAUTHORIZED);
    }
  }

  getAccessToken(payload: Partial<AccessTokenPayload>) {
    const timestamp = (add = 0) => Math.floor(Date.now() / 1000) + add;
    const jwtTTL = this.configService.get('ACCESS_TOKEN_TTL');

    return this.jwtService.sign({
      ...payload,
      iat: timestamp(),
      exp: timestamp(+jwtTTL)
    }, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}
