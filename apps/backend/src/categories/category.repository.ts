import { Category } from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbstractRepository } from '@app/common';

export class CategoryRepository extends AbstractRepository<Category> {
  protected readonly logger = new Logger(CategoryRepository.name);

  constructor(
    @InjectModel(Category.name) categoryModel: Model<Category>,
    configService: ConfigService,
  ) {
    super(categoryModel, configService);
  }
}
