import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cartitem.entity';
import { CreateCartItemDto } from './dto/create-cartitem.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
  ) {}

  async getCart(user: User): Promise<CartItem[]> {
    return this.cartRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'ASC' },
    });
  }

  async addItem(dto: CreateCartItemDto, user: User): Promise<CartItem> {
    const item = this.cartRepository.create({ ...dto, user });
    return this.cartRepository.save(item);
  }

  async removeItem(id: number, user: User): Promise<void> {
    const item = await this.cartRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!item) {
      throw new NotFoundException(`Позиция ${id} не найдена в корзине`);
    }
    await this.cartRepository.remove(item);
  }

  async clearCart(user: User): Promise<void> {
    await this.cartRepository.delete({ user: { id: user.id } });
  }
}
