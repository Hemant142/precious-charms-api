import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class Cart {
  @Prop()
  userId!: string;

  @Prop()
  productId!: string;

  @Prop()
  quantity!: number;
}