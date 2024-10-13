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
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAllPermission(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return this.permissionService.getAllPermission(page, perPage, search, req);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Post('create')
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.createPermission(createPermissionDto);
  }

  @Get(':id')
  getPermissionById(@Param('id') id: string) {
    return this.permissionService.getPermissionById(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Patch(':id')
  updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.updatePermission(id, updatePermissionDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Delete(':id')
  softDeletePermission(@Param('id') id: string) {
    return this.permissionService.softDeletePermission(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Delete('auth/:id')
  deletePermission(@Param('id') id: string) {
    return this.permissionService.deletePermission(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Get('restore/:id')
  restorePermission(@Param('id') id: string) {
    return this.permissionService.restorePermission(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get('auth/with-deleted')
  getDeletedPermission(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return this.permissionService.getDeletedPermission(
      page,
      perPage,
      search,
      req,
    );
  }
}
