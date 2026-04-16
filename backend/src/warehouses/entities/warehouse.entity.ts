import { IsDate, IsString, Length } from 'class-validator';
import { Cutitem } from 'src/cutitems/entities/cutitem.entity';
import { Cut } from 'src/cuts/entities/cut.entity';
import { Markup } from 'src/markups/entities/markup.entity';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column({
    unique: true,
  })
  @Length(2, 30)
  @IsString()
  name: string;

  @Column({
    default: 'Описание склада',
  })
  @Length(2, 200)
  @IsString()
  description: string;

  @OneToMany(() => Cutitem, (cutitem) => cutitem.warehouse, {
    onDelete: 'CASCADE',
  })
  cutitems: Cutitem[];

  @OneToOne(() => Markup, (markup) => markup.warehouse, {
    onDelete: 'CASCADE', // при удалении склада удаляем наценку (наценка не может существовать без склада )
  })
  markup: Markup;

  @OneToMany(() => Priceitem, (priceitem) => priceitem.warehouse)
  priceitems: Priceitem[];

  // @ManyToMany(() => Cut, (cut) => cut.warehouses)
  // @JoinTable()
  // cuts: Cut[];
}
