import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BilletCartData } from '../dto/create-cartitem.dto';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  // Ссылка на товар в прайсе (для информации, не жёсткий FK)
  @Column()
  @IsNumber()
  priceitemId: number;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  size: string;

  // Количество штук
  @Column()
  @IsNumber()
  quantity: number;

  // Вес в тоннах
  @Column('decimal')
  @IsNumber()
  weightTons: number;

  // Цена за тонну (с наценкой за малотоннажность)
  @Column('decimal')
  @IsNumber()
  pricePerTon: number;

  // Стоимость товара
  @Column('decimal')
  @IsNumber()
  totalGoodsPrice: number;

  // Стоимость резки (0 если резки нет)
  @Column('decimal', { default: 0 })
  @IsNumber()
  totalCuttingCost: number;

  // Описание резки (например "Ленточная × 3")
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  cuttingDescription: string | null;

  // Название склада (сохраняется на момент добавления в корзину)
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  warehouseName: string | null;

  // Данные расчёта заготовок (только для позиций из вкладки "Расчёт заготовок")
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  billetData: BilletCartData | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
