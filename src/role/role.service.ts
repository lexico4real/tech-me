import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { Role } from './entities/role.entity';
import { PermissionRepository } from 'src/permission/permission.repository';
import { customResponse } from '../../common/response/response';
import { ResponseType as Response } from '../../common/response/response.enum';
import { Permission } from 'src/permission/entities/permission.entity';
import { In } from 'typeorm';
import { Request } from 'express';
import { isUUID } from 'class-validator';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository,

    @InjectRepository(PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissionIds } = createRoleDto;

    let permissions = [];
    if (permissionIds && permissionIds.length > 0) {
      permissions = await this.getPermissionByIds(permissionIds);
      createRoleDto.permissions = permissions;

      return await this.roleRepository.createRole(createRoleDto);
    } else {
      customResponse({
        responseType: Response.BAD_REQUEST,
        partMsg: 'Minimum of one permission is required',
      });
    }
  }

  async getPermissionByIds(ids: Array<string>): Promise<Permission[]> {
    let found: Permission[];
    for (const id of ids) {
      const isUuid = isUUID(id);
      if (!isUuid) {
        customResponse({
          responseType: Response.BAD_REQUEST,
          partMsg: `invalid id ${id}`,
        });
      }
    }
    try {
      found = await this.permissionRepository.find({
        where: {
          id: In([...ids]),
        },
      });
      if (!found || found.length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `E_NOT_F`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      if (error.message === 'E_NOT_F') {
        customResponse({
          responseType: Response.NOT_FOUND,
          error: error.message,
          partMsg: ids.toString(),
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
    return found;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { permissionIds } = updateRoleDto;

    let permissions = [];
    if (permissionIds && permissionIds.length > 0) {
      permissions = await this.getPermissionByIds(permissionIds);
      updateRoleDto.permissions = permissions;
    }
    return await this.roleRepository.updateRole(id, updateRoleDto);
  }

  async getRoleById(id: string): Promise<Role> {
    return await this.roleRepository.getRoleById(id);
  }

  async getAllRole(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<Role[] | any> {
    return await this.roleRepository.getAllRole(page, perPage, search, req);
  }

  async softDeleteRole(id: string): Promise<any> {
    const role = await this.roleRepository.findOne(id);
    return await this.roleRepository.softDeleteRole(role);
  }

  async restoreRole(id: string): Promise<void> {
    const role = await this.roleRepository.findOneWithDeleted(id);
    await this.roleRepository.restoreRole(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findOneWithDeleted(id);
    if (role && role.deletedAt === null) {
      return await this.roleRepository.softDeleteRole(role);
    } else {
      return await this.roleRepository.deletePermanently(role);
    }
  }

  async getDeletedRole(
    page?: number,
    perPage?: number,
    search?: string,
    @Req() req?: Request,
  ): Promise<any> {
    return await this.roleRepository.findWithDeleted(
      page,
      perPage,
      search,
      req,
    );
  }
}
