import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartGuestController } from './cart-guest.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cartitem.entity';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), MailerModule],
  controllers: [CartController, CartGuestController],
  providers: [CartService],
})
export class CartModule {}
