/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Product } from './entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AbstractRepository } from '@app/common';
import { Logger } from '@nestjs/common';

export class ProductRepository extends AbstractRepository<Product> {
  protected readonly logger = new Logger(Product.name);
  constructor(
    @InjectModel(Product.name) productModel: Model<Product>,
    protected readonly configService: ConfigService,
  ) {
    super(productModel, configService);
  }

  /**
   * Get min and max price range for products under a category
   */
  async getPriceRange(categoryId: string) {
    const result = await this.model.aggregate([
      {
        $match: { categoryId: new Types.ObjectId(categoryId), isActive: true },
      },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    if (result.length > 0) {
      return {
        min: result[0].minPrice,
        max: result[0].maxPrice,
      };
    }

    return { min: 0, max: 0 };
  }
  /**
   * Get all unique tags for products under a category
   */
  async getCategoryTags(categoryId: string): Promise<string[]> {
    const result = await this.model.aggregate([
      {
        $match: { categoryId: new Types.ObjectId(categoryId), isActive: true },
      },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $project: { _id: 0, tag: '$_id' } },
    ]);

    return result.map((r) => r.tag);
  }
}
