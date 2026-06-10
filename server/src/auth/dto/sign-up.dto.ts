import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export class SignUpDto {
  @ApiProperty({ example: 'Jane Doe', minLength: 3 })
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @ApiProperty({ example: 'Passw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one letter, one number and one special character',
  })
  password: string;
}
