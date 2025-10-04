import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Category extends AbstractDocument {
  @Prop({ unique: true })
  name: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: Date.now() })
  updatedAt: Date;

  @Prop()
  slug: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  parentCategory: string; // For nested categories

  @Prop()
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
