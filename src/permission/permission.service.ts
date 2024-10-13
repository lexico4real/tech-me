import { Injectable, Req } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionRepository } from 'src/permission/permission.repository';
import { Permission } from 'src/permission/entities/permission.entity';
import { Request } from 'express';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return await this.permissionRepository.createPermission(
      createPermissionDto,
    );
  }

  async updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return await this.permissionRepository.updatePermission(
      id,
      updatePermissionDto,
    );
  }

  async getPermissionById(id: string): Promise<Permission> {
    return await this.permissionRepository.getPermissionById(id);
  }

  async getAllPermission(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<Permission[] | any> {
    return await this.getAllPermission(page, perPage, search, req);
  }

  async softDeletePermission(id: string): Promise<any> {
    const permission = await this.permissionRepository.findOne(id);
    return await this.permissionRepository.softDeletePermission(permission);
  }

  async restorePermission(id: string): Promise<void> {
    const permission = await this.permissionRepository.findOneWithDeleted(id);
    await this.permissionRepository.restorePermission(permission);
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.permissionRepository.findOneWithDeleted(id);
    if (permission && permission.deletedAt === null) {
      return await this.permissionRepository.softDeletePermission(permission);
    } else {
      return await this.permissionRepository.deletePermanently(permission);
    }
  }

  async getDeletedPermission(
    page?: number,
    perPage?: number,
    search?: string,
    @Req() req?: Request,
  ): Promise<any> {
    return await this.permissionRepository.findWithDeleted(
      page,
      perPage,
      search,
      req,
    );
  }
}
