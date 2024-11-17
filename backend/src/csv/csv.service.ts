import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import csv from 'csv-parser';
import axios from 'axios';
import * as iconv from 'iconv-lite';
import { InjectRepository } from '@nestjs/typeorm';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { mapBaseName } from 'src/utils/mapping';
import { WarehousesService } from 'src/warehouses/warehouses.service';

@Injectable()
export class CsvService {
  constructor(
    @InjectRepository(Priceitem)
    private readonly priceitemsRepository: Repository<Priceitem>,
    private readonly warehousesService: WarehousesService,
  ) {}

  items: Array<Priceitem>;

  async fetchCsvFile() {
    console.log('Загружаем CSV...');
    try {
      const { data } = await axios.get(
        'https://www.metallotorg.ru/import/prise_last.csv',
        // 'http://localhost:3002/csv/prise_last.csv',
        {
          responseType: 'arraybuffer',
          responseEncoding: 'binary',
        },
      );
      const buf = iconv.decode(Buffer.from(data), 'win1251');
      // console.log(buf);
      const rounds: Array<Priceitem> = this.parseString(buf);
      this.saveItems(rounds);
      return rounds;
    } catch (error) {
      throw new Error(error);
    }
  }

  // метод получает на вход одну большую строку - содержимое csv файла
  // преобразует эту строку в массив строк по разделителю '\n'
  // проверяем, чтобы название было 'Круг'
  parseString(buffer: string): Array<Priceitem> {
    const arr: Array<string> = buffer.split('\n');
    const rounds: Array<Priceitem> = [];
    arr.map(async (item) => {
      if (this.isRound(item)) {
        rounds.push(await this.parseItem(item));
      }
    });
    // console.log(krugi.length);
    return rounds;
  }

  // метод получает на вход строку,
  // проверяет, что в этой строке есть подстрока 'Круг',
  // и в случае успеха - возвращает true
  isRound(item: string): boolean {
    const arr: Array<string> = item.split(';');
    // console.log(arr[7]);
    if (arr[7].includes('Круг') && arr[6].includes('УГЛИ')) {
      return true;
    }
    return false;
  }

  // метод получает на вход строку
  // возвращает объект типа Priceitem
  async parseItem(item: string): Promise<Priceitem> {
    const arr: Array<string> = item.split(';');
    console.log(`${arr[0]} ${arr[1]} ${arr[2]}`);

    console.log('arr[6]');
    console.log(arr[6]);

    const warehouse = await this.warehousesService.findOne({
      where: { name: mapBaseName(arr[6]) },
    });

    const createdPriceitem: Priceitem = {
      id: uuidv4(),
      actualBalance: this.parsePotentiallyGroupedFloat(arr[0]),
      unitWeight: this.parsePotentiallyGroupedFloat(arr[1]),
      unitPrice: this.parsePotentiallyGroupedFloat(arr[2]),
      pricePer1tn: this.parsePotentiallyGroupedFloat(arr[3]),
      pricePer5tn: this.parsePotentiallyGroupedFloat(arr[4]),
      pricePer15tn: this.parsePotentiallyGroupedFloat(arr[5]),
      baseName: mapBaseName(arr[6]),
      name: arr[7],
      size: arr[8],
      surface: arr[9],
      other: arr[10],
      productGroup: arr[11],
      length: this.parsePotentiallyGroupedFloat(arr[12]),
      warehouse: warehouse,
    };

    console.log(typeof createdPriceitem.actualBalance);

    return createdPriceitem;
  }

  parsePotentiallyGroupedFloat(stringValue: string) {
    return parseFloat(stringValue.replace(',', '.').replace(' ', ''));
  }

  async saveItems(rounds: Array<Priceitem>) {
    await this.priceitemsRepository.save(rounds);
  }
}
