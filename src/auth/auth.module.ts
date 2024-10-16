import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './user.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as config from 'config';
import { RoleRepository } from '../role/role.repository';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          process.env.JWT_SECRET ||
          configService.get('JWT_SECRET') ||
          jwtConfig['secret'],
        signOptions: {
          expiresIn: process.env.EXPIRESIN || Number(jwtConfig['expiresIn']),
        },
      }),
    }),
    TypeOrmModule.forFeature([UsersRepository, RoleRepository]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
