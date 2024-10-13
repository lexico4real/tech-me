import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAllRole(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return this.roleService.getAllRole(page, perPage, search, req);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Post('create')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Get(':id')
  getRoleById(@Param('id') id: string) {
    return this.roleService.getRoleById(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Patch(':id')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Delete(':id')
  softDeleteRole(@Param('id') id: string) {
    return this.roleService.softDeleteRole(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Delete('auth/:id')
  deleteRole(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Get('restore/:id')
  restoreRole(@Param('id') id: string) {
    return this.roleService.restoreRole(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get('auth/with-deleted')
  getDeletedRole(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return this.roleService.getDeletedRole(page, perPage, search, req);
  }
}
