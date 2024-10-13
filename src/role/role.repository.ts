import { EntityRepository, Repository, FindManyOptions, ILike } from 'typeorm';
import { Request } from 'express';
import { HttpException, HttpStatus, Req } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import Logger from '../../config/log4js/logger';
import { ResponseType as Response } from '../../common/response/response.enum';
import { customResponse } from '../../common/response/response';

import { generatePagination } from '../../common/util/pagination';
import { UpdateRoleDto } from './dto/update-role.dto';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
  logger: Logger = new Logger();

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const role = this.create(createRoleDto);
      return await this.save(role);
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        customResponse({
          responseType: Response.CONFLICT,
          partMsg: createRoleDto.name,
          error: error.message,
          logName: 'role-repository',
          logType: 'error',
        });
      }
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'role-repository',
        logType: 'error',
      });
    }
  }

  async getAllRole(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<Role[] | any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<Role>['where'] = search
        ? [{ name: ILike(`%${search}%`) }]
        : undefined;

      const [result, total] = await this.findAndCount({
        where,
        order: { name: 'DESC' },
        skip,
        take: perPage,
        relations: ['permissions'],
      });

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'role-repository',
        logType: 'error',
      });
    }
  }

  async getRoleById(id: string): Promise<Role> {
    const isUuid = isUUID(id);
    if (!isUuid) {
      customResponse({
        responseType: Response.BAD_REQUEST,
        partMsg: id,
      });
    }
    try {
      const query = this.createQueryBuilder('role');
      query.where('role.id = :id', { id });
      const role = await query.getOne();
      if (!role) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `E_NOT_F`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return role;
    } catch (error) {
      if (error.message === 'E_NOT_F') {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: id,
          error: error.message,
          logName: 'role-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'role-repository',
          logType: 'error',
        });
      }
    }
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { name, description } = updateRoleDto;
    const role = await this.getRoleById(id);
    try {
      if (name) role.name = name;
      if (description) role.description = description;
      role.updatedAt = new Date();

      await this.createQueryBuilder()
        .update(Role)
        .set({
          name: role.name,
          description: role.description,
          updatedAt: role.updatedAt,
        })
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        customResponse({
          responseType: Response.CONFLICT,
          error: error.message,
          logName: 'role-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'role-repository',
          logType: 'error',
        });
      }
    }
    return role;
  }

  async softDeleteRole(role: Role): Promise<void> {
    if (!role) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Role',
      });
    }
    role.deletedAt = new Date();
    await this.save(role);
    customResponse({
      responseType: Response.NO_CONTENT,
    });
  }

  async restoreRole(role: Role): Promise<void> {
    if (!role || role.deletedAt === null) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Role',
      });
    }
    role.deletedAt = null;
    await this.save(role);
    throw new HttpException(
      { statuscode: HttpStatus.FOUND, message: `"${role.name}" restored` },
      HttpStatus.FOUND,
    );
  }

  async findOneWithDeleted(id: string): Promise<Role> {
    return await this.findOne({ id }, { withDeleted: true });
  }

  async findWithDeleted(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<Role>['where'] = search
        ? [{ name: ILike(`%${search}%`) }]
        : undefined;

      const [result, total] = await this.findAndCount({
        where,
        withDeleted: true,
        order: { name: 'DESC' },
        skip,
        take: perPage,
      });

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'role-repository',
        logType: 'error',
      });
    }
  }

  async deletePermanently(role: Role): Promise<void> {
    if (!role) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Role',
      });
    }
    await this.remove(role);
    customResponse({
      responseType: Response.NO_CONTENT,
    });
  }
}
