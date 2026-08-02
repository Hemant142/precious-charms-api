import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId!: Types.ObjectId;

  @Prop()
  quantity!: number;

  @Prop()
  priceAtPurchase!: number;

  @Prop()
  name!: string;

  @Prop()
  avatar!: string;

  @Prop()
  brand!: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  totalAmount!: number;

  @Prop({ default: 'placed' })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'Address' })
  addressId!: Types.ObjectId;

  @Prop({ type: [OrderItem], default: [] })
  items!: OrderItem[];

  @Prop()
  orderDate!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
