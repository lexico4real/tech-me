import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { UsersRepository } from './user.repository';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { RoleRepository } from '../role/role.repository';
import { AccountStatus } from '../../common/util/enums/account-status';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,

    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository,

    private jwtService: JwtService,
  ) {}

  async createUser(registerDto: RegisterDto): Promise<void> {
    const { password, roleId } = registerDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    let role = await this.roleRepository.findOne(roleId);
    if (!roleId || !role) {
      role = await this.roleRepository.findOne({ name: 'Student' });
    }

    registerDto.password = hashedPassword;
    registerDto.roleId = roleId;
    registerDto.role = role;
    return await this.usersRepository.createUser(registerDto);
  }

  // async signIn(
  //   authCredentialsDto: SignInDto,
  // ): Promise<{ accessToken: string }> {
  //   const { email, password } = authCredentialsDto;
  //   const user = await this.usersRepository.findOne({ email });

  //   if (user && (await bcrypt.compare(password, user.password))) {
  //     const payload: JwtPayload = { email };
  //     const accessToken: string = this.jwtService.sign(payload);
  //     await this.usersRepository.update(user.id, {
  //       status: AccountStatus.ACTIVE,
  //       lastLogin: new Date(),
  //     });
  //     return { accessToken };
  //   } else {
  //     throw new UnauthorizedException('Please check your login credentials');
  //   }
  // }

  async signIn(
    authCredentialsDto: SignInDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialsDto;

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (
      user.status === AccountStatus.BLACKLISTED ||
      user.status === AccountStatus.LOCKED
    ) {
      throw new UnauthorizedException('Account is blacklisted or locked');
    }

    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
    };
    const accessToken: string = this.jwtService.sign(payload);

    await this.usersRepository.update(user.id, {
      status: AccountStatus.ACTIVE,
      lastLogin: new Date(),
    });

    return { accessToken };
  }

  async getAllUsers(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<User[]> {
    return await this.usersRepository.getAllUsers(page, perPage, search, req);
  }
}
