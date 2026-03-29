import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** GET /orders — список заказов текущего пользователя */
  @Get()
  getOrders(@Req() req: any) {
    return this.ordersService.getOrders(req.user);
  }

  /** GET /orders/:id — один заказ */
  @Get(':id')
  getOrder(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ordersService.getOrder(id, req.user);
  }

  /** POST /orders/from-cart — создать заказ из корзины */
  @Post('from-cart')
  createFromCart(@Req() req: any) {
    return this.ordersService.createFromCart(req.user);
  }
}
