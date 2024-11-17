import { IsNumber, IsString } from 'class-validator';

export class CreateCutitemDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  warehouse_id: number;

  @IsNumber()
  cut_id: number;
}
