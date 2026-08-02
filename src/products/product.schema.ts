import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop()
  category!: string;

  @Prop()
  brand!: string;

  @Prop({ required: true })
  price!: number;

  @Prop()
  avatar!: string;

  @Prop({ default: 0 })
  rating!: number;

  @Prop()
  about!: string;

  @Prop()
  info!: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
