import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';
import { generateSlug } from '@app/common';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}
  create(createCategoryDto: CreateCategoryDto) {
    const now = new Date();
    const categoryToCreate = {
      ...createCategoryDto,
      createdAt: now,
      updatedAt: now,
      slug: generateSlug(createCategoryDto.name),
    };
    return this.categoryRepository.create(categoryToCreate);
  }

  createBulk(createCategoryDto: CreateCategoryDto[]) {
    const now = new Date();
    const categoriesToCreate = createCategoryDto.map((dto) => ({
      ...dto,
      createdAt: now,
      updatedAt: now,
      slug: generateSlug(dto.name),
    }));
    return this.categoryRepository.bulkCreate(categoriesToCreate);
  }
  findAll() {
    return this.categoryRepository.find({});
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({ _id: id });
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const updatedData = { ...updateCategoryDto };

    // If name is updated, regenerate the slug
    if (updateCategoryDto.name) {
      updatedData.slug = updateCategoryDto.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    }
    return this.categoryRepository.update({ _id: id }, updatedData);
  }

  remove(id: string) {
    return this.categoryRepository.delete({ _id: id });
  }
}
