import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUrl,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SeoMetadataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) keywords?: string[];
}

export class CreateMedicalConditionDto {
  // Basic Info
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alternateName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() disambiguatingDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() url?: string;

  // Clinical Details
  @ApiPropertyOptional() @IsOptional() @IsString() pathophysiology?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() epidemiology?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expectedPrognosis?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() naturalProgression?: string;

  // Causes & Risks
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) cause?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) riskFactor?: string[];

  // Symptoms & Diagnosis
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) signOrSymptom?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) differentialDiagnosis?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) typicalTest?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) stage?: string[];

  // Treatments & Prevention
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) possibleTreatment?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() primaryPrevention?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() secondaryPrevention?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) drug?: string[];

  // Specialty
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) relevantSpecialty?: string[];

  // Media (0 to 5 images)
  @ApiPropertyOptional({ type: [String], description: 'Max 5 images' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  image?: string[];

  // State Management
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isArchived?: boolean;

  // SEO
  @ApiPropertyOptional({ type: SeoMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}

export class UpdateMedicalConditionDto extends PartialType(CreateMedicalConditionDto) {}
