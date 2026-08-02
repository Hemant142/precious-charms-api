import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from './address.schema';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name)
    private addressModel: Model<AddressDocument>,
  ) {}

  private mapAddress(doc: AddressDocument) {
    const obj = doc.toObject();
    return {
      id: obj._id.toString(),
      name: obj.name,
      mobileNumber: obj.mobileNumber,
      mobile_number: obj.mobileNumber,
      pincode: obj.pincode,
      pincod: obj.pincode,
      houseNo: obj.houseNo,
      house_no: obj.houseNo,
      area: obj.area,
      town: obj.town,
      userId: obj.userId.toString(),
    };
  }

  async findByUser(userId: string) {
    const addresses = await this.addressModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    return addresses.map((a) => this.mapAddress(a));
  }

  async create(
    userId: string,
    body: {
      name: string;
      mobileNumber?: string;
      mobile_number?: string;
      pincode?: string;
      pincod?: string;
      houseNo?: string;
      house_no?: string;
      area?: string;
      town: string;
    },
  ) {
    const address = await this.addressModel.create({
      userId: new Types.ObjectId(userId),
      name: body.name,
      mobileNumber: body.mobileNumber || body.mobile_number,
      pincode: body.pincode || body.pincod,
      houseNo: body.houseNo || body.house_no,
      area: body.area || '',
      town: body.town,
    });
    return this.mapAddress(address);
  }

  async update(userId: string, id: string, body: Partial<Address>) {
    const address = await this.addressModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      {
        ...(body.name && { name: body.name }),
        ...((body as any).mobileNumber || (body as any).mobile_number
          ? {
              mobileNumber:
                (body as any).mobileNumber || (body as any).mobile_number,
            }
          : {}),
        ...((body as any).pincode || (body as any).pincod
          ? { pincode: (body as any).pincode || (body as any).pincod }
          : {}),
        ...((body as any).houseNo || (body as any).house_no
          ? { houseNo: (body as any).houseNo || (body as any).house_no }
          : {}),
        ...(body.area !== undefined && { area: body.area }),
        ...(body.town && { town: body.town }),
      },
      { new: true },
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.mapAddress(address);
  }

  async remove(userId: string, id: string) {
    const address = await this.addressModel.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return { message: 'Address deleted', id };
  }
}
