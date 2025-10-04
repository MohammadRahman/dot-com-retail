import {
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryDto } from '@app/common';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  price: number;

  @IsOptional()
  images: string[]; // Array for multiple images

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @IsNotEmpty()
  inventory: number;

  @IsNotEmpty()
  sku: string;

  @IsNotEmpty()
  tags: string[];

  @IsNotEmpty()
  attributes: Record<string, any>;

  @IsNotEmpty()
  isActive: boolean;
}
