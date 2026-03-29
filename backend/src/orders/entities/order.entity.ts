import { IsDate, IsNumber } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  /** Итого за металл, ₽ */
  @Column('decimal')
  @IsNumber()
  totalGoods: number;

  /** Итого за резку, ₽ */
  @Column('decimal', { default: 0 })
  @IsNumber()
  totalCutting: number;

  /** Итого по заказу, ₽ */
  @Column('decimal')
  @IsNumber()
  totalAll: number;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
