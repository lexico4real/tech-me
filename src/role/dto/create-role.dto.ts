import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  permissionIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  permissions?: any[];
}
