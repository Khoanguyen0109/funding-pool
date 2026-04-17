import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('auth.facebook.appId') ?? '',
      clientSecret: configService.get<string>('auth.facebook.appSecret') ?? '',
      callbackURL: configService.get<string>('auth.facebook.callbackUrl') ?? '',
      scope: ['email'],
      profileFields: ['emails', 'name', 'displayName', 'photos'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ): Promise<void> {
    const user = await this.authService.validateOAuthUser({
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value,
      oauthProvider: 'facebook',
      oauthId: profile.id,
    });
    done(null, user);
  }
}
