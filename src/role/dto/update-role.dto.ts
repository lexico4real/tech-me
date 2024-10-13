import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
