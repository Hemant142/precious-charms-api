import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class Product {
  @Prop()
  name!: string;

  @Prop()
  category!: string;

  @Prop()
  brand!: string;

  @Prop()
  price!: number;

  @Prop()
  avatar!: string;

  @Prop()
  rating!: number;
}