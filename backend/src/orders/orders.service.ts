import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartItem } from 'src/cart/entities/cartitem.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
  ) {}

  /** Получить все заказы пользователя (от новых к старым) */
  async getOrders(user: User): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  /** Получить один заказ пользователя */
  async getOrder(id: number, user: User): Promise<Order> {
    return this.ordersRepository.findOneOrFail({
      where: { id, user: { id: user.id } },
    });
  }

  /**
   * Создать заказ из текущей корзины пользователя.
   * Корзина при этом НЕ очищается — пользователь решает сам.
   */
  async createFromCart(user: User): Promise<Order> {
    const cartItems = await this.cartRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'ASC' },
    });

    if (cartItems.length === 0) {
      throw new Error('Корзина пуста');
    }

    const totalGoods = cartItems.reduce(
      (s, i) => s + Number(i.totalGoodsPrice),
      0,
    );
    const totalCutting = cartItems.reduce(
      (s, i) => s + Number(i.totalCuttingCost),
      0,
    );
    const totalAll = totalGoods + totalCutting;

    const items: Partial<OrderItem>[] = cartItems.map((ci) => ({
      priceitemId: ci.priceitemId,
      name: ci.name,
      size: ci.size,
      quantity: ci.quantity,
      weightTons: ci.weightTons,
      pricePerTon: ci.pricePerTon,
      totalGoodsPrice: ci.totalGoodsPrice,
      totalCuttingCost: ci.totalCuttingCost,
      cuttingDescription: ci.cuttingDescription,
      billetData: ci.billetData,
    }));

    const order = this.ordersRepository.create({
      user,
      totalGoods,
      totalCutting,
      totalAll,
      items: items as OrderItem[],
    });

    return this.ordersRepository.save(order);
  }
}
