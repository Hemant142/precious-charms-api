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
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guars';
import { CurrentUser } from '../auth/current-user.decorator';
import { resolveTargetUserId } from '../auth/resolve-user-id';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  findAll(
    @CurrentUser() user: { userId: string; role?: string },
    @Query('userId') userId?: string,
  ) {
    const targetId = resolveTargetUserId(user, userId);
    return this.addressService.findByUser(targetId);
  }

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() body: Record<string, string>,
  ) {
    return this.addressService.create(user.userId, body as any);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.addressService.update(user.userId, id, body as any);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.addressService.remove(user.userId, id);
  }
}
