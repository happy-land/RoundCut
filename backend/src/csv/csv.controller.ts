import { Controller, Get, Res } from '@nestjs/common';
import { CsvService } from './csv.service';

import { Response } from 'express';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Get()
  async getCSVFile(): Promise<Array<string>> {
    return await this.csvService.fetchCsvFile();
  }
}
