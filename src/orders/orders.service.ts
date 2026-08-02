import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { Cart, CartDocument } from '../cart/cart.schema';
import { Product, ProductDocument } from '../products/product.schema';
import { Address, AddressDocument } from '../address/address.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async createFromCart(userId: string, addressId?: string) {
    const cartItems = await this.cartModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('productId')
      .exec();

    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }

    if (addressId) {
      const address = await this.addressModel.findOne({
        _id: addressId,
        userId: new Types.ObjectId(userId),
      });
      if (!address) {
        throw new NotFoundException('Address not found');
      }
    }

    const items = cartItems.map((item) => {
      const product = item.productId as unknown as ProductDocument & {
        _id: Types.ObjectId;
      };
      const productObj = product?.toObject?.() ?? product;
      return {
        productId: productObj?._id,
        quantity: item.quantity,
        priceAtPurchase: productObj?.price ?? 0,
        name: productObj?.name,
        avatar: productObj?.avatar,
        brand: productObj?.brand,
      };
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0,
    );

    const orderDate = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      totalAmount,
      status: 'placed',
      addressId: addressId ? new Types.ObjectId(addressId) : undefined,
      items,
      orderDate,
    });

    await this.cartModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });

    return this.mapOrder(order);
  }

  async findByUser(userId: string) {
    const orders = await this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    return orders.map((o) => this.mapOrder(o));
  }

  async findAll() {
    const orders = await this.orderModel.find().sort({ createdAt: -1 });
    return orders.map((o) => this.mapOrder(o));
  }

  async findOne(userId: string, id: string) {
    const order = await this.orderModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.mapOrder(order);
  }

  /** Flattened product list for frontend YourOrder compatibility */
  async getOrderProductsFlat(userId: string) {
    const orders = await this.findByUser(userId);
    const productIds = [
      ...new Set(
        orders.flatMap((order) =>
          order.items
            .map((item: any) => item.productId)
            .filter(Boolean)
            .map((id: any) => id.toString()),
        ),
      ),
    ];

    const products = productIds.length
      ? await this.productModel.find({ _id: { $in: productIds } })
      : [];
    const productMap = new Map(
      products.map((p) => [p._id.toString(), p.toObject()]),
    );

    return orders.flatMap((order) =>
      order.items.map((item: any) => {
        const productId = item.productId?.toString?.() ?? item.productId;
        const product = productMap.get(productId);
        return {
          id: productId,
          name: item.name ?? product?.name,
          price: item.priceAtPurchase,
          avatar: item.avatar ?? product?.avatar,
          brand: item.brand ?? product?.brand,
          category: product?.category ?? '',
          about: product?.about ?? '',
          orderDate: order.orderDate,
          quantity: item.quantity,
          orderId: order.id,
          status: order.status,
        };
      }),
    );
  }

  private mapOrder(order: OrderDocument) {
    const obj = order.toObject();
    return {
      id: obj._id.toString(),
      userId: obj.userId.toString(),
      totalAmount: obj.totalAmount,
      status: obj.status,
      addressId: obj.addressId?.toString(),
      orderDate: obj.orderDate,
      items: obj.items.map((item: any) => ({
        ...item,
        productId: item.productId?.toString?.() ?? item.productId,
      })),
      createdAt: (obj as any).createdAt,
    };
  }
}
