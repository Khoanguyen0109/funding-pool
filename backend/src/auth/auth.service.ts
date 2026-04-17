import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ accessToken: string; user: User }> {
    const user = await this.usersService.createWithPassword({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
    });

    return {
      accessToken: this.generateToken(user),
      user,
    };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: User }> {
    let user: User | null = null;

    if (dto.email) {
      user = await this.usersService.findByEmailWithPassword(dto.email);
    } else if (dto.phone) {
      user = await this.usersService.findByPhoneWithPassword(dto.phone);
    }

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user as any;
    return {
      accessToken: this.generateToken(user),
      user: userWithoutPassword,
    };
  }

  async validateOAuthUser(data: {
    email: string;
    name: string;
    avatar?: string;
    oauthProvider: string;
    oauthId: string;
  }): Promise<User> {
    return this.usersService.findOrCreateFromOAuth(data);
  }

  generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async getUserFromToken(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}
