import {
  ConflictException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { EntityRepository, Repository, FindManyOptions, ILike } from 'typeorm';
import { Request } from 'express';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { generatePagination } from 'common/util/pagination';
import { ResponseType as Response } from '../../common/response/response.enum';
import { customResponse } from '../../common/response/response';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(registerDto: RegisterDto): Promise<void> {
    try {
      const user = this.create(registerDto);
      await this.save(user);
    } catch (error) {
      if (
        error.code === '23505' ||
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getAllUsers(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<User[] | any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<User>['where'] = search
        ? [{ name: ILike(`%${search}%`) }]
        : undefined;

      const queryBuilder = this.createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where(where ? 'user.firstName ILIKE :name' : '1=1', {
          name: `%${search}%`,
        })
        .orderBy('user.firstName', 'DESC')
        .skip(skip)
        .take(perPage);

      queryBuilder.select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.otherName',
        'user.email',
        'user.lgaOfResidence',
        'user.stateOfResidence',
        'user.status',
        'user.lastLogin',
        'role.id',
        'role.name',
      ]);

      const [result, total] = await queryBuilder.getManyAndCount();

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      console.log({ error });
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'user-repository',
        logType: 'error',
      });
    }
  }
}
