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
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() streetAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLocality?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressRegion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postalCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressCountry?: string;
}

export class GeoLocationDto {
  @ApiProperty({ enum: ['Point'], default: 'Point' })
  @IsEnum(['Point'])
  type: string = 'Point';

  @ApiProperty({ type: [Number], description: '[longitude, latitude]' })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  coordinates: number[];
}

export class SeoMetadataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) keywords?: string[];
}

export class CreateRoomDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() accommodationCategory?: string;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) bed?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() occupancy?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() floorLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() floorSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() numberOfRooms?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() numberOfBathroomsTotal?: number;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) amenityFeature?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() petsAllowed?: boolean;

  @ApiProperty() @IsNumber() perNightPrice: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() inStock?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUrl() tourBookingPage?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ type: GeoLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoLocationDto)
  geo?: GeoLocationDto;

  @ApiPropertyOptional({ type: [String], description: 'Must provide between 5 and 20 images' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(5)
  @ArrayMaxSize(20)
  image?: string[];

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isArchived?: boolean;

  @ApiPropertyOptional({ type: SeoMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
