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
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guars';
import { CurrentUser } from '../auth/current-user.decorator';
import { resolveTargetUserId } from '../auth/resolve-user-id';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(
    @CurrentUser() user: { userId: string; role?: string },
    @Query('userId') userId?: string,
  ) {
    const targetId = resolveTargetUserId(user, userId);
    return this.cartService.getCart(targetId);
  }

  @Post()
  addItem(
    @CurrentUser() user: { userId: string },
    @Body() body: { productId: string; quantity?: number },
  ) {
    return this.cartService.addItem(
      user.userId,
      body.productId,
      body.quantity ?? 1,
    );
  }

  @Patch(':productId')
  updateQuantity(
    @CurrentUser() user: { userId: string },
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(
      user.userId,
      productId,
      body.quantity,
    );
  }

  @Delete(':productId')
  removeItem(
    @CurrentUser() user: { userId: string },
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(user.userId, productId);
  }

  @Delete()
  clearCart(@CurrentUser() user: { userId: string }) {
    return this.cartService.clearCart(user.userId);
  }
}
