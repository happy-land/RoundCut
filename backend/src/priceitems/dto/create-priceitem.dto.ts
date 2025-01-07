import { IsNumber, IsString } from 'class-validator';

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

  @IsNumber()
  pricePer15tn: number;

  @IsString()
  baseName: string;

  @IsString()
  name: string;

  @IsString()
  size: string;

  @IsString()
  surface: string;

  @IsString()
  other: string;

  @IsString()
  productGroup: string;

  @IsNumber()
  length: number;

  @IsString()
  categoryName: string;

  // @IsNumber()
  // warehouse_id: number;

  // @IsNumber()
  // category_id: number;
}
