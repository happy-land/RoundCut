import { IsDate, IsNumber, IsString } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Priceitem {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column('decimal')
  @IsNumber()
  actualBalance: number;

  @Column('decimal')
  @IsNumber()
  unitWeight: number;

  @Column('decimal')
  @IsNumber()
  unitPrice: number;

  @Column('decimal')
  @IsNumber()
  pricePer1tn: number;

  @Column('decimal')
  @IsNumber()
  pricePer5tn: number;

  @Column('decimal')
  @IsNumber()
  pricePer15tn: number;

  @Column()
  @IsString()
  baseName: string | null;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  size: string;

  // в прайсе это поле "Длина, Раскрой"
  @Column()
  @IsString()
  surface: string; // для кругов 2ГП, для поковок б/обточки

  @Column()
  @IsString()
  other: string; // для кругов - ГОСТ

  @Column()
  @IsString()
  productGroup: string;

  @Column('decimal')
  @IsNumber()
  length: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.priceitems)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ManyToOne(() => Category, (category) => category.priceitems)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
