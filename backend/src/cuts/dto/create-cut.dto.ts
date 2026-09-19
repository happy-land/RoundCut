import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { CutCode, CutProfile } from '../entities/cut.entity';

export class CreateCutDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsEnum(CutCode)
  @IsOptional()
  code?: CutCode;

  @IsEnum(CutProfile)
  @IsOptional()
  profile?: CutProfile;
}
