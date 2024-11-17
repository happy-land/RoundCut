import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(2, {
    message: 'Описание склада не может быть короче 2-х символов',
  })
  @MaxLength(200, {
    message: 'Описание склада не может быть длиннее 200 символов',
  })
  description?: string;
}
