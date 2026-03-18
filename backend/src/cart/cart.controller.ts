import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cartitem.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user);
  }

  @Post()
  addItem(@Body() dto: CreateCartItemDto, @Req() req: any) {
    return this.cartService.addItem(dto, req.user);
  }

  @Delete('all')
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user);
  }

  @Delete(':id')
  removeItem(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cartService.removeItem(id, req.user);
  }
}
