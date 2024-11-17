import { IsString } from 'class-validator';

export class CreateCutDto {
  @IsString()
  name: string; //Товар-Наименование
}
