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

export class OpeningHoursDto {
  @ApiProperty() @IsString() dayOfWeek: string;
  @ApiProperty() @IsString() opens: string;
  @ApiProperty() @IsString() closes: string;
}

export class SeoMetadataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) keywords?: string[];
}

export class CreateHospitalDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() disambiguatingDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slogan?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() url?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) awards?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) alumni?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() owner?: string;

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

  @ApiPropertyOptional() @IsOptional() @IsString() logo?: string;

  @ApiPropertyOptional({ type: [String], description: 'Must provide between 5 and 15 images' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(5)
  @ArrayMaxSize(15)
  image?: string[];

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) medicalSpecialty?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) availableService?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAcceptingNewPatients?: boolean;

  @ApiPropertyOptional({ type: [OpeningHoursDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  openingHoursSpecification?: OpeningHoursDto[];

  @ApiPropertyOptional() @IsOptional() @IsString() priceRange?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isArchived?: boolean;

  @ApiPropertyOptional({ type: SeoMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}

export class UpdateHospitalDto extends PartialType(CreateHospitalDto) {}
