import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SchemeItem } from './scheme-item.entity';

export enum SchemeStatus {
  DRAFT = 'draft',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
}

@Entity()
export class Scheme {
  @PrimaryGeneratedColumn()
  id: number;

  /** Номер документа, напр. "л36430" (формируется от id заказа) */
  @Column({ unique: true })
  @IsString()
  number: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'enum', enum: SchemeStatus, default: SchemeStatus.DRAFT })
  @IsEnum(SchemeStatus)
  status: SchemeStatus;

  /** Склад (снимок на момент формирования) */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  warehouseName: string | null;

  /** Клиент (снимок) */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  clientName: string | null;

  /** Менеджер, сформировавший схему (снимок) */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  managerName: string | null;

  @OneToMany(() => SchemeItem, (item) => item.scheme, {
    cascade: true,
    eager: true,
  })
  items: SchemeItem[];

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
