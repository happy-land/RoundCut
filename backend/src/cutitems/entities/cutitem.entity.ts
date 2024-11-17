import { IsDate, IsNumber, IsString, Length } from 'class-validator';
import { Cut } from 'src/cuts/entities/cut.entity';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Cutitem {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column()
  @Length(2, 30)
  @IsString()
  name: string;

  @Column()
  @IsNumber()
  amount: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.cutitems)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ManyToOne(() => Cut, (cut) => cut.cutitems)
  @JoinColumn({ name: 'cut_id' })
  cut: Cut;
}
