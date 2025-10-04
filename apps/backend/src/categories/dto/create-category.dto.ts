import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  image: string;

  @IsString()
  @IsOptional()
  parentCategory: string; // For nested categories

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  slug: string;
}
