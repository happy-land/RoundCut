import { IsNumber, IsString } from 'class-validator';

export class CreateMarkupDto {
  @IsString()
  name: string;

  @IsNumber()
  level1: number;

  @IsNumber()
  level2: number;

  @IsNumber()
  level3: number;

  @IsNumber()
  level4: number;

  @IsNumber()
  level5: number;

  @IsNumber()
  level6: number;

  @IsNumber()
  level7: number;

  @IsNumber()
  level8: number;

  @IsNumber()
  warehouseId: number;
}
