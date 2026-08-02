import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guars';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('_page') _page?: string,
    @Query('limit') limit?: string,
    @Query('_limit') _limit?: string,
    @Query('category') category?: string | string[],
    @Query('brand') brand?: string | string[],
    @Query('name') name?: string,
    @Query('q') q?: string | string[],
    @Query('_sort') sort?: string,
    @Query('_order') order?: 'asc' | 'desc',
  ) {
    return this.productsService.findAll({
      page: Number(page || _page) || 1,
      limit: Number(limit || _limit) || 12,
      category,
      brand,
      name,
      q: Array.isArray(q) ? q[0] : q,
      sort,
      order,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.productsService.create(body);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.productsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
