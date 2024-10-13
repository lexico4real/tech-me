import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Gender } from '../../../common/util/enums/gender';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  otherName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    enum: Gender,
    required: false,
  })
  @IsEnum(Gender, {
    message: `Gender must be a valid enum value: ${Object.values(Gender)}`,
  })
  @IsNotEmpty()
  gender: string;

  @ApiProperty()
  @MinLength(15)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  password: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lgaOfResidence: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stateOfResidence: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roleId?: string;

  role: any;
}
