import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Scheme } from './scheme.entity';

/** Одна заготовка в позиции схемы */
export interface SchemePiece {
  lengthMm: number;
  qty: number;
}

/** Раскладка одного круга: какие заготовки режем и какой хвост остаётся */
export interface SchemeBar {
  index: number;
  piecesMm: number[];
  remainderMm: number;
}

@Entity()
export class SchemeItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Scheme, (scheme) => scheme.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheme_id' })
  scheme: Scheme;

  /** Снимок названия позиции, напр. "Круг Ст20 320мм" */
  @Column()
  @IsString()
  productName: string;

  /** ГОСТ (снимок из прайса, поле other) */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  gost: string | null;

  @Column('decimal')
  @IsNumber()
  weightTons: number;

  /** Всего шт (кругов задействовано) */
  @Column('int')
  @IsNumber()
  totalQty: number;

  /** Режем штук */
  @Column('int')
  @IsNumber()
  cutQty: number;

  /** Станок, напр. "Лентопильный станок" */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  machine: string | null;

  /** Общая длина круга, мм */
  @Column('int')
  @IsNumber()
  barLengthMm: number;

  /** Толщина реза (пропил), мм */
  @Column('decimal')
  @IsNumber()
  kerfMm: number;

  /** Торцевой рез, мм */
  @Column('decimal')
  @IsNumber()
  endCutMm: number;

  /** Хвост последнего круга, мм */
  @Column('int')
  @IsNumber()
  remainderMm: number;

  /** Заготовки: длины и количество (снимок) */
  @Column('jsonb')
  pieces: SchemePiece[];

  /** Раскладка по кругам — вычислена при генерации (снимок) */
  @Column('jsonb')
  bars: SchemeBar[];

  @Column('int')
  @IsNumber()
  sortOrder: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;
}
