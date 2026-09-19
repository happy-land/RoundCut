import { Body, Controller, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { SendGuestOrderDto } from './dto/send-guest-order.dto';

/** Публичные эндпоинты корзины (без JWT) */
@Controller('cart')
export class CartGuestController {
  constructor(private readonly cartService: CartService) {}

  @Post('send-guest')
  sendGuestOrder(@Body() dto: SendGuestOrderDto) {
    return this.cartService.sendGuestOrder(dto);
  }
}
