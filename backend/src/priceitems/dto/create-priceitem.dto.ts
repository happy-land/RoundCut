import { IsNumber } from 'class-validator';

export class CreatePriceitemDto {
  @IsNumber()
  actualBalance: number;

  @IsNumber()
  unitWeight: number;

  @IsNumber()
  unitPrice?: number;

  @IsNumber()
  pricePer1tn: number;

  @IsNumber()
  pricePer5tn: number;
}
