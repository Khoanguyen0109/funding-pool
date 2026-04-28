import { Module, type Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { UsersModule } from '../users/users.module';
import { PoolsModule } from '../pools/pools.module';

function optionalOAuthProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.GOOGLE_CLIENT_ID) {
    providers.push(GoogleStrategy);
  }
  if (process.env.FACEBOOK_APP_ID) {
    providers.push(FacebookStrategy);
  }

  return providers;
}

@Module({
  imports: [
    UsersModule,
    PoolsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.jwtSecret'),
        signOptions: { expiresIn: configService.get('auth.jwtExpiresIn') },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, ...optionalOAuthProviders()],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
