import {
  IsDate,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Column,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Markup {
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

  @Column()
  @IsNumber()
  @IsPositive()
  level1: number;

  @Column()
  @IsNumber()
  @IsPositive()
  level2: number;

  @Column()
  @IsNumber()
  @IsPositive()
  level3: number;

  @Column()
  @IsNumber()
  @IsPositive()
  level4: number;

  @Column()
  @IsNumber()
  @IsPositive()
  level5: number;

  @Column()
  @IsNumber()
  @IsPositive()
  level6: number;

  @Column()
  @IsNumber()
  @IsPositive()
  level7: number;

  @Column()
  @IsNumber()
  @IsPositive()
  level8: number;

  @OneToOne(() => Warehouse, {
    onDelete: 'CASCADE',
    // eager: true, // https://github.com/typeorm/typeorm/issues/3288#issuecomment-663143343
  })
  @JoinColumn() // создаст Foreign Key и не даст создать наценку
  // без указания склада.
  warehouse: Warehouse;
}
