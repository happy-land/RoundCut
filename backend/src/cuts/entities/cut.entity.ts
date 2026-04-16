import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import {
  IsDate,
  IsString,
  Length,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Cutitem } from 'src/cutitems/entities/cutitem.entity';

export enum CutCode {
  BANDSAW = 'bandsaw',
  CUTOFF = 'cutoff',
  GAS = 'gas',
  GUILLOTINE = 'guillotine',
  PLASMA = 'plasma',
  THERMAL = 'thermal',
  LASER = 'laser',
}

export enum CutProfile {
  BAR = 'bar',
  SHEET = 'sheet',
}

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

  @Column({ type: 'enum', enum: CutCode, nullable: true })
  @Index()
  @IsEnum(CutCode)
  @IsOptional()
  code?: CutCode;

  @Column({ type: 'enum', enum: CutProfile, nullable: true })
  @Index()
  @IsEnum(CutProfile)
  @IsOptional()
  profile?: CutProfile;

  @OneToMany(() => Cutitem, (cutitem) => cutitem.cut)
  cutitems: Cutitem[];
}