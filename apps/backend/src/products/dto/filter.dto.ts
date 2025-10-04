import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsNumber({}, { each: false })
  @Type(() => Number)
  minPrice?: number;
  @IsOptional()
  @IsNumber({}, { each: false })
  @Type(() => Number)
  maxPrice?: number;
  @IsOptional()
  @IsString()
  tags?: string;
  @IsOptional()
  @IsBoolean()
  inStock?: boolean = true;
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @IsString()
  sortBy?: string;
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsArray()
  attributes?: Record<string, any>;
}
