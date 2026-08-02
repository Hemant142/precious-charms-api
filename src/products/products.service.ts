import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  private mapProduct(doc: ProductDocument) {
    const obj = doc.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string | string[];
    brand?: string | string[];
    name?: string;
    q?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const filter: Record<string, unknown> = {};

    if (query.name) {
      filter.name = query.name;
    }

    if (query.category) {
      const categories = Array.isArray(query.category)
        ? query.category
        : [query.category];
      const cleaned = categories.filter(Boolean);
      if (cleaned.length === 1) filter.category = cleaned[0];
      else if (cleaned.length > 1) filter.category = { $in: cleaned };
    }

    if (query.brand) {
      const brands = Array.isArray(query.brand) ? query.brand : [query.brand];
      const cleaned = brands.filter(Boolean);
      if (cleaned.length === 1) filter.brand = cleaned[0];
      else if (cleaned.length > 1) filter.brand = { $in: cleaned };
    }

    if (query.q) {
      const search = Array.isArray(query.q) ? query.q[0] : query.q;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { about: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
        ];
      }
    }

    const sort: Record<string, 1 | -1> = {};
    if (query.sort) {
      sort[query.sort] = query.order === 'desc' ? -1 : 1;
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data: items.map((item) => this.mapProduct(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.mapProduct(product);
  }

  async create(body: Partial<Product>) {
    const product = await this.productModel.create(body);
    return this.mapProduct(product);
  }

  async update(id: string, body: Partial<Product>) {
    const product = await this.productModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.mapProduct(product);
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'Product deleted', id };
  }
}
