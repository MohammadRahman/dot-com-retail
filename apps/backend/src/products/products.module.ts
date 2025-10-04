import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from '@app/common';
import { Product, ProductSchema } from './entities/product.entity';
import { ProductRepository } from './products.repository';
import { CategoryRepository } from 'src/categories/category.repository';
import {
  Category,
  CategorySchema,
} from 'src/categories/entities/category.entity';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.number().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
      }),
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, Product, CategoryRepository],
})
export class ProductsModule {}
