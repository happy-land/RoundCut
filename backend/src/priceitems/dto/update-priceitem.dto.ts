import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceitemDto } from './create-priceitem.dto';

export class UpdatePriceitemDto extends PartialType(CreatePriceitemDto) {}
