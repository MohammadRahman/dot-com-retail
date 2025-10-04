import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from '@app/common';
import { Category, CategorySchema } from './entities/category.entity';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { CategoryRepository } from './category.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URL: Joi.string().required(),
        BULK_UPLOAD_BATCH_SIZE: Joi.number().required(),
      }),
    }),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository],
})
export class CategoriesModule {}
