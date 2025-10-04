import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilterDto } from './dto/filter.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('category/:categorySlug')
  async getProductsByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() filters: FilterDto,
  ) {
    return this.productsService.findProductsByCategory(categorySlug, {
      ...filters,
    });
  }

  @Post('products')
  @UseInterceptors(FileInterceptor('images'))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() files: Express.Multer.File[],
  ) {
    console.log('body', createProductDto);
    console.log('file', files);
    return this.productsService.create(createProductDto, files);
  }
  @Post('products/bulk-upload')
  // @UseInterceptors(FileInterceptor('images'))
  createBulk(
    @Body() createProductDto: any,
    // @UploadedFile() files: Express.Multer.File[],
  ) {
    console.log('body', createProductDto);
    // console.log('file', files);
    return this.productsService.createBulk(createProductDto);
  }

  @Get('products')
  findAll() {
    return this.productsService.findAll();
  }
  @Post('category/products')
  findAllProductsUnderOneCategory(@Body() reqBody: any) {
    console.log('req body received category', reqBody);
    const { category } = reqBody;
    return this.productsService.findByCategory(category);
  }

  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch('products/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete('products/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
