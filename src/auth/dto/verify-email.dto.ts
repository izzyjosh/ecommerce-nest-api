import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyDto {
  @ApiProperty({
    example: 'verification-token',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token field is required' })
  token!: string;
}
