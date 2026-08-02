import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  mobileNumber!: string;

  @Prop({ required: true })
  pincode!: string;

  @Prop({ required: true })
  houseNo!: string;

  @Prop()
  area!: string;

  @Prop({ required: true })
  town!: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
