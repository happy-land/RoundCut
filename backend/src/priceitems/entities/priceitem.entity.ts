import { IsDate, IsNumber, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Priceitem {
  // @PrimaryGeneratedColumn()
  // id: number;

  @PrimaryColumn()
  id: string;

  // @CreateDateColumn()
  // @IsDate()
  // createdAt: Date;

  // @UpdateDateColumn()
  // @IsDate()
  // updatedAt: Date;

  // @Column()
  // @IsNumber()
  // inStock: number; // В продаже

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
  baseName: string;

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
}
