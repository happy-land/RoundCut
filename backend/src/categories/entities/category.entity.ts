import { IsDate, IsNumber, IsString, Length } from 'class-validator';
import { Cutitem } from 'src/cutitems/entities/cutitem.entity';
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

  // @OneToMany(() => Cutitem, (cutitem) => cutitem.category)
  // cutitems: Cutitem[];
}
