import { PartialType } from '@nestjs/mapped-types';
import { CreateCutitemDto } from './create-cutitem.dto';

export class UpdateCutitemDto extends PartialType(CreateCutitemDto) {}
