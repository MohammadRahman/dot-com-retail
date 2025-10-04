/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './products.repository';
import { CategoryRepository } from 'src/categories/category.repository';
import { uploadToCloudinary } from '@app/common';
import { Product } from './entities/product.entity';
import { FilterDto } from './dto/filter.dto';

export interface ProductFilters {
  category?: string; // category slug or ID
  categories?: string[]; // multiple categories
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt' | 'popularity' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  attributes?: Record<string, any>;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly productModel: Product,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const now = new Date();
    const categoryId = createProductDto.category._id;
    const isCategoryExit = await this.categoryRepository.findOne({
      _id: categoryId,
    });

    if (!isCategoryExit) return null;
    const uploadedImages = Array.isArray(files)
      ? await Promise.all(
          files.map((file) => uploadToCloudinary(file, 'products')),
        )
      : [await uploadToCloudinary(files, 'products')];
    const newProduct = {
      ...createProductDto,
      createdAt: now,
      updatedAt: now,
      categoryId,
      // images: uploadedImages.length ? uploadedImages : createProductDto.images,
      images: uploadedImages.length ? uploadedImages : createProductDto.images,
    };
    return this.productRepository.create(newProduct);
  }
  async createBulk(
    createProductDto: any,
    // files: Express.Multer.File[],
  ) {
    const now = new Date();
    const files = [];
    // const categoryId = createProductDto.category._id;
    // const isCategoryExit = await this.categoryRepository.findOne({
    //   _id: categoryId,
    // });

    // if (!isCategoryExit) return null;
    const uploadedImages = Array.isArray(files)
      ? await Promise.all(
          files.map((file) => uploadToCloudinary(file, 'products')),
        )
      : [await uploadToCloudinary(files, 'products')];
    const newProduct = createProductDto.map((doc) => ({
      ...doc,
      createdAt: now,
      updatedAt: now,
      categoryId: doc.category._id,
      // images: uploadedImages.length ? uploadedImages : createProductDto.images,
      images: uploadedImages.length ? uploadedImages : createProductDto.images,
    }));
    return this.productRepository.bulkCreate(newProduct);
  }

  findAll() {
    return this.productRepository.find({});
  }
  findByCategory(category: string) {
    console.log('search products for category', category);
    return this.productRepository.find({ categoryId: category });
  }

  findOne(id: string) {
    return this.productRepository.findOne({ _id: id });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update({ _id: id }, updateProductDto);
  }

  remove(id: string) {
    return this.productRepository.delete({ _id: id });
  }

  // Find all products under specific category with filters
  async findProductsByCategory(categorySlug: string, filters: FilterDto = {}) {
    const {
      minPrice,
      maxPrice,
      tags,
      inStock,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      attributes,
    } = filters;
    // Get category ID from slug
    const category = await this.categoryRepository.findOne({
      slug: categorySlug,
      // isActive: true,
    });
    console.log('category', category);
    // Build query
    const query: any = { categoryId: category._id, isActive: true };
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    // Inventory filter
    if (inStock !== undefined) {
      query.inventory = inStock ? { $gt: 0 } : { $lte: 0 };
    }
    // Tags filter
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    // Search in name and description (text search)
    if (search) {
      query.$text = { $search: search };
    }
    // Attributes filter (for product specifications)
    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        query[`attributes.${key}`] = attributes[key];
      });
    }
    // Build sort
    let sort: any = {};
    if (search && sortBy === 'relevance') {
      sort = { score: { $meta: 'textScore' } };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productRepository
        .findRaw(query)
        .populate('categoryData', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(search ? { score: { $meta: 'textScore' } } : {}) // Include score for text search
        .exec(),
      this.productRepository.countDocuments(query),
    ]);
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        category: category.name,
        priceRange: await this.productRepository.getPriceRange(
          String(category._id),
        ),
        availableTags: await this.productRepository.getCategoryTags(
          String(category._id),
        ),
      },
    };
  }
}
