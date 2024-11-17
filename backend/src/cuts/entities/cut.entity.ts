import { IsDate, IsString, Length } from 'class-validator';
import { Cutitem } from 'src/cutitems/entities/cutitem.entity';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Cut {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column()
  @Length(1, 250)
  @IsString()
  name: string;

  @OneToMany(() => Cutitem, (cutitem) => cutitem.cut)
  cutitems: Cutitem[];

  // @ManyToMany(() => Warehouse, (warehouse) => warehouse.cuts)
  // warehouses: Warehouse[];
}
