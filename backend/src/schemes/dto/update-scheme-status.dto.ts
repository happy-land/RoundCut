import { IsEnum } from 'class-validator';
import { SchemeStatus } from '../entities/scheme.entity';

export class UpdateSchemeStatusDto {
  @IsEnum(SchemeStatus)
  status: SchemeStatus;
}
