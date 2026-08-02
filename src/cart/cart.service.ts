import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';
import { Product, ProductDocument } from '../products/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('productId')
      .exec();

    return items.map((item) => {
      const product = item.productId as unknown as ProductDocument & {
        _id: Types.ObjectId;
      };
      const productObj = product?.toObject?.() ?? product;
      return {
        cartItemId: item._id.toString(),
        quantity: item.quantity,
        id: productObj?._id?.toString?.() ?? String(item.productId),
        name: productObj?.name,
        price: productObj?.price,
        about: productObj?.about,
        category: productObj?.category,
        brand: productObj?.brand,
        rating: productObj?.rating,
        avatar: productObj?.avatar,
        info: productObj?.info,
      };
    });
  }

  async addItem(userId: string, productId: string, quantity = 1) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
        quantity,
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    await this.cartModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.cartModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
    return [];
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const item = await this.cartModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
      },
      { quantity },
      { new: true },
    );

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.getCart(userId);
  }
}
