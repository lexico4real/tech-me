import { EntityRepository, Repository, FindManyOptions, ILike } from 'typeorm';
import { Request } from 'express';
import { HttpException, HttpStatus, Req } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './entities/permission.entity';
import Logger from '../../config/log4js/logger';
import { ResponseType as Response } from '../../common/response/response.enum';
import { customResponse } from '../../common/response/response';

import { isUUID } from 'class-validator';
import { generatePagination } from '../../common/util/pagination';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {
  logger: Logger = new Logger();

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    try {
      const permission = this.create(createPermissionDto);
      return await this.save(permission);
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        customResponse({
          responseType: Response.CONFLICT,
          partMsg: createPermissionDto.name,
          error: error.message,
          logName: 'permission-repository',
          logType: 'error',
        });
      }
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'permission-repository',
        logType: 'error',
      });
    }
  }

  async getAllPermission(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<Permission[] | any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<Permission>['where'] = search
        ? [{ name: ILike(`%${search}%`) }]
        : undefined;

      const [result, total] = await this.findAndCount({
        where,
        order: { name: 'DESC' },
        skip,
        take: perPage,
      });

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'permission-repository',
        logType: 'error',
      });
    }
  }

  async getPermissionById(id: string): Promise<Permission> {
    const isUuid = isUUID(id);
    if (!isUuid) {
      customResponse({
        responseType: Response.BAD_REQUEST,
        partMsg: id,
      });
    }
    try {
      const query = this.createQueryBuilder('permission');
      query.where('permission.id = :id', { id });
      const permission = await query.getOne();
      if (!permission) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `E_NOT_F`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return permission;
    } catch (error) {
      if (error.message === 'E_NOT_F') {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: id,
          error: error.message,
          logName: 'permission-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'permission-repository',
          logType: 'error',
        });
      }
    }
  }

  async updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const { name, description } = updatePermissionDto;
    const permission = await this.getPermissionById(id);
    try {
      if (name) permission.name = name;
      if (description) permission.description = description;
      permission.updatedAt = new Date();

      await this.createQueryBuilder()
        .update(Permission)
        .set({
          name: permission.name,
          description: permission.description,
          updatedAt: permission.updatedAt,
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
          logName: 'permission-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'permission-repository',
          logType: 'error',
        });
      }
    }
    return permission;
  }

  async softDeletePermission(permission: Permission): Promise<void> {
    if (!permission) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Permission',
      });
    }
    permission.deletedAt = new Date();
    await this.save(permission);
    customResponse({
      responseType: Response.NO_CONTENT,
    });
  }

  async restorePermission(permission: Permission): Promise<void> {
    if (!permission || permission.deletedAt === null) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Permission',
      });
    }
    permission.deletedAt = null;
    await this.save(permission);
    throw new HttpException(
      {
        statuscode: HttpStatus.FOUND,
        message: `"${permission.name}" restored`,
      },
      HttpStatus.FOUND,
    );
  }

  async findOneWithDeleted(id: string): Promise<Permission> {
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

      const where: FindManyOptions<Permission>['where'] = search
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
        logName: 'permission-repository',
        logType: 'error',
      });
    }
  }

  async deletePermanently(permission: Permission): Promise<void> {
    if (!permission) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Permission',
      });
    }
    await this.remove(permission);
    customResponse({
      responseType: Response.NO_CONTENT,
    });
  }
}
