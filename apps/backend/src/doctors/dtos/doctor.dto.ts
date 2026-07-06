import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUrl,
  ArrayMinSize,
  ArrayMaxSize,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() streetAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLocality?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressRegion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postalCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressCountry?: string;
}

export class GeoCoordinatesDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() longitude?: number;
}

export class SeoMetadataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) keywords?: string[];
}

export class CreateDoctorDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() url?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) occupationalCategory?: string[];

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) medicalSpecialty?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) availableService?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAcceptingNewPatients?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() usNPI?: string;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsMongoId({ each: true }) hospitalAffiliation?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString() telephone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() faxNumber?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ type: GeoCoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoCoordinatesDto)
  geo?: GeoCoordinatesDto;

  @ApiPropertyOptional({ type: [String], description: 'Must provide between 1 and 5 images' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  image?: string[];

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isArchived?: boolean;

  @ApiPropertyOptional({ type: SeoMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {}
