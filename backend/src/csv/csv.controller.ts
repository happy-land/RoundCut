import { Controller, Post } from '@nestjs/common';
import { CsvService } from './csv.service';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  // @Post()
  // async getCSVFile() {
  //   return await this.csvService.fetchCsvFile();
  // }

  @Post('extract')
  async extractData() {
    return await this.csvService.extractData();
  }
}
