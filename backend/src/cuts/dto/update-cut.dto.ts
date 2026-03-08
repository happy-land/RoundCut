import { IsOptional, IsString, Length, IsEnum } from 'class-validator';
import { CutCode, CutProfile } from '../entities/cut.entity';

export class UpdateCutDto {
  @IsString()
  @Length(1, 250)
  @IsOptional()
  name?: string;

  @IsEnum(CutProfile)
  @IsOptional()
  profile?: CutProfile;

  @IsEnum(CutCode)
  @IsOptional()
  code?: CutCode;
}
