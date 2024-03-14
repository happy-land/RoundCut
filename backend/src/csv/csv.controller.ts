import { Controller, Get, Res } from '@nestjs/common';
import { CsvService } from './csv.service';

import { Response } from 'express';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Get()
  async getCSVFile(): Promise<Array<Priceitem>> {
    return await this.csvService.fetchCsvFile();
  }
}
