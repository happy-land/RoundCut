import { IsNumber, IsOptional, IsString } from 'class-validator';

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
}
