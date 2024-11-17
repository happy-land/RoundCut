import { PartialType } from '@nestjs/mapped-types';
import { CreateCutDto } from './create-cut.dto';

export class UpdateCutDto extends PartialType(CreateCutDto) {}
