import { IsDate, IsString, Length } from 'class-validator';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
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

  @OneToMany(() => Priceitem, (priceitem) => priceitem.category)
  priceitems: Priceitem[];
}
