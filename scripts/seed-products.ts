import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../src/products/product.schema';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productModel = app.get<Model<Product>>(getModelToken(Product.name));

  const dbPath = path.resolve(
    'D:/Project/PreciousAndCharms/adaptable-oven-8035/db.json',
  );

  if (!fs.existsSync(dbPath)) {
    console.error('db.json not found at', dbPath);
    await app.close();
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const products = (db.products || []).map((p: any) => ({
    name: p.name,
    price: Number(p.price),
    about: p.about || '',
    category: p.category || '',
    brand: p.brand || '',
    rating: Number(p.rating) || 0,
    avatar: p.avatar || '',
    info: p.info || '',
  }));

  const count = await productModel.countDocuments();
  if (count > 0) {
    console.log(`Products already seeded (${count}). Skipping.`);
  } else {
    await productModel.insertMany(products);
    console.log(`Seeded ${products.length} products.`);
  }

  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
