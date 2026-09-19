import { PartialType } from '@nestjs/mapped-types';
import { CreateMarkupDto } from './create-markup.dto';

export class UpdateMarkupDto extends PartialType(CreateMarkupDto) {}
