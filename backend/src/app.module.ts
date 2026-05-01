import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import pusherConfig from './config/pusher.config';
import { UsersModule } from './users/users.module';
import { PoolsModule } from './pools/pools.module';
import { CategoriesModule } from './categories/categories.module';
import { ContributionsModule } from './contributions/contributions.module';
import { ExpensesModule } from './expenses/expenses.module';
import { InvitesModule } from './invites/invites.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PusherModule } from './pusher/pusher.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, pusherConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    DashboardModule,
    UsersModule,
    PoolsModule,
    CategoriesModule,
    ContributionsModule,
    ExpensesModule,
    InvitesModule,
    PusherModule,
    HealthModule,
  ],
})
export class AppModule {}
