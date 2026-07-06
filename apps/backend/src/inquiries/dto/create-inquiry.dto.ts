import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInquiryDto {
  @ApiProperty({ description: 'Full name of the patient/user' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Country code or name' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Description of the medical condition' })
  @IsString()
  @IsOptional()
  medicalCondition?: string;

  @ApiPropertyOptional({ description: 'URL to the uploaded medical document' })
  @IsString()
  @IsOptional()
  documentUrl?: string;

  @ApiProperty({ description: 'Source form of the inquiry', enum: ['contact_form', 'need_help'] })
  @IsEnum(['contact_form', 'need_help'])
  source: 'contact_form' | 'need_help';
}
