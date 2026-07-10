import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BlogSeoMetadataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) keywords?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() ogTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ogDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ogImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() canonicalUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() focusKeyword?: string;
}

export class CreateBlogDto {
  @ApiProperty() @IsString() title: string;

  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverImage?: string;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) categories?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString() author?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional() @IsOptional() @IsDateString() publishedAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isArchived?: boolean;

  @ApiPropertyOptional({ type: BlogSeoMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BlogSeoMetadataDto)
  seo?: BlogSeoMetadataDto;
}

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
