import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Product extends AbstractDocument {
  @Prop({ unique: true })
  name: string;
  @Prop()
  description: string;
  @Prop()
  price: number;
  @Prop()
  images: string[]; // Array for multiple images
  @Prop()
  categoryId: string;
  @Prop()
  inventory: number;
  @Prop()
  sku: string;
  @Prop()
  tags: string[];
  @Prop({ type: Object })
  attributes: Record<string, any>;
  @Prop()
  isActive: boolean;
  @Prop({ default: Date.now() })
  createdAt: Date;
  @Prop({ default: Date.now() })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Create text index for search
ProductSchema.index(
  {
    name: 'text',
    description: 'text',
    tags: 'text',
    'attributes.key': 'text',
    'attributes.value': 'text',
  },
  {
    name: 'product_search_index',
    weights: {
      name: 10, // Name is most important
      tags: 5, // Tags are somewhat important
      description: 3, // Description is less important
      'attributes.key': 2,
      'attributes.value': 1,
    },
    default_language: 'english',
  },
);

// Other indexes for performance
ProductSchema.index({ categoryId: 1, price: 1, isActive: 1 });
ProductSchema.index({ tags: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ inventory: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual populate
ProductSchema.virtual('categoryData', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});
