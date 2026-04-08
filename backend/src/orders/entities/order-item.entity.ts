import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { BilletCartData } from 'src/cart/dto/create-cartitem.dto';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @IsNumber()
  priceitemId: number;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  size: string;

  @Column()
  @IsNumber()
  quantity: number;

  @Column('decimal')
  @IsNumber()
  weightTons: number;

  @Column('decimal')
  @IsNumber()
  pricePerTon: number;

  @Column('decimal')
  @IsNumber()
  totalGoodsPrice: number;

  @Column('decimal', { default: 0 })
  @IsNumber()
  totalCuttingCost: number;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  cuttingDescription: string | null;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  warehouseName: string | null;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  billetData: BilletCartData | null;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
