import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guars';
import { CurrentUser } from '../auth/current-user.decorator';
import { resolveTargetUserId } from '../auth/resolve-user-id';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @CurrentUser() user: { userId: string; role?: string },
    @Query('userId') userId?: string,
  ) {
    const targetId = resolveTargetUserId(user, userId);
    return this.ordersService.findByUser(targetId);
  }

  @Get('products')
  getOrderProducts(
    @CurrentUser() user: { userId: string; role?: string },
    @Query('userId') userId?: string,
  ) {
    const targetId = resolveTargetUserId(user, userId);
    return this.ordersService.getOrderProductsFlat(targetId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { userId: string; role?: string },
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    const targetId = resolveTargetUserId(user, userId);
    return this.ordersService.findOne(targetId, id);
  }

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() body: { addressId?: string },
  ) {
    return this.ordersService.createFromCart(user.userId, body?.addressId);
  }
}
