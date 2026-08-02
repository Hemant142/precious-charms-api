import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Order {
  @Prop()
  userId!: string;

  @Prop()
  totalAmount!: number;

  @Prop()
  status!: string;

  @Prop()
  addressId!: string;

  @Prop({
    type: [
      {
        productId: String,
        quantity: Number,
        priceAtPurchase: Number,
      },
    ],
  })
  items!: [];
}