import { IsNumber, IsOptional, IsString } from 'class-validator';

/** Данные расчёта заготовок — сохраняются только для позиций из вкладки "Расчёт заготовок" */
export interface BilletCartData {
  /** Толщина реза, мм */
  cutThickness: number;
  /** Торцевой рез, мм */
  endCut: number;
  /** Список заготовок */
  workpieces: { length: number; quantity: number }[];
  /** Всего кругов задействовано */
  numCircles: number;
  /** Из них целых кругов */
  numCompleteCircles: number;
  /** Вес целых кругов, тонн */
  wholeCirclesWeight: number;
  /** Цена за тонну целых кругов (с наценкой за малотоннажность), ₽ */
  wholeCirclesPricePerTon: number;
  /** Вес части последнего круга, тонн (0 если частичной продажи нет) */
  partWeight: number;
  /** Цена за тонну части (с 12% надбавкой, округлено до 100), ₽ */
  partPricePerTon: number;
  /** Стоимость металла (целые + часть), ₽ */
  billetGoodsCost: number;
  /** Стоимость резки, ₽ */
  cuttingCostForBillets: number;
  /** Всего резов */
  totalCuts: number;
}

export class CreateCartItemDto {
  @IsNumber()
  priceitemId: number;

  @IsString()
  name: string;

  @IsString()
  size: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  weightTons: number;

  @IsNumber()
  pricePerTon: number;

  @IsNumber()
  totalGoodsPrice: number;

  @IsNumber()
  totalCuttingCost: number;

  @IsString()
  @IsOptional()
  cuttingDescription?: string;

  @IsString()
  @IsOptional()
  warehouseName?: string;

  @IsOptional()
  billetData?: BilletCartData;
}
