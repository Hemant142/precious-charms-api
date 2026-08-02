import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class Address {
  @Prop()
  name!: string;

  @Prop()
  mobileNumber!: string;

  @Prop()
  pincode!: string;

  @Prop()
  houseNo!: string;

  @Prop()
  area!: string;

  @Prop()
  town!: string;
}