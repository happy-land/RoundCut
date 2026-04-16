import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as iconv from 'iconv-lite';
import { InjectRepository } from '@nestjs/typeorm';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { mapBaseName } from 'src/utils/mapping';
import { WarehousesService } from 'src/warehouses/warehouses.service';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class CsvService {
  constructor(
    @InjectRepository(Priceitem)
    private readonly priceitemsRepository: Repository<Priceitem>,
    private readonly warehousesService: WarehousesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  items: Array<Priceitem>;
  rounds: Array<Priceitem> = [];
  // categories: Array<string>;

  // method extracts csv file from remote server
  // returns array of strings - price
  // url: '/csv/extract'
  async extractData() {
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
      const items: Array<string> = buf.split('\n');
      return items;
    } catch (error) {
      throw new Error(error);
    }
  }

  // TODO: remove this method
  // async fetchCsvFile() {
  //   try {
  //     const { data } = await axios.get(
  //       'https://www.metallotorg.ru/import/prise_last.csv',
  //       // 'http://localhost:3002/csv/prise_last.csv',
  //       {
  //         responseType: 'arraybuffer',
  //         responseEncoding: 'binary',
  //       },
  //     );
  //     const buf = iconv.decode(Buffer.from(data), 'win1251');
  //     this.parseString(buf);
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // }

  // метод получает на вход одну большую строку - содержимое csv файла
  // преобразует эту строку в массив строк по разделителю '\n'
  // проверяем, чтобы название было 'Круг'
  // parseString(buffer: string): Array<Priceitem> {
  async parseString(buffer: string) {
    const arr: Array<string> = buffer.split('\n');
    const rounds: Array<Priceitem> = [];
    // arr.map(async (item) => {
    //   if (this.isRound(item)) {
    //     await this.priceitemsRepository.save(await this.parseItem(item));
    //   }
    // });
    return rounds;
  }

  // метод получает на вход строку,
  // проверяет, что в этой строке есть подстрока 'Круг',
  // и в случае успеха - возвращает true
  isRound(item: string): boolean {
    const arr: Array<string> = item.split(';');
    // console.log(arr[7]);
    // if (arr[7].includes('Круг') && arr[6].includes('УГЛИ')) {
    if (arr[6].includes('ЛОБНЯ')) {
      return true;
    }
    return false;
  }

  // метод получает на вход строку
  // возвращает объект типа Priceitem
  // async parseItem(item: string): Promise<Priceitem> {
  // async parseItem(arr: Array<number | string>): Promise<Priceitem> {
  //   // find warehouse in database
  //   const warehouse = await this.warehousesService.findOne({
  //     where: { name: mapBaseName(arr[6] as string) },
  //   });

  //   // find category in database
  //   const category = await this.categoriesService.findOne({
  //     where: { name: arr[14] as string },
  //   });

  //   const createdPriceitem: Priceitem = {
  //     id: uuidv4(),
  //     actualBalance: this.parsePotentiallyGroupedFloat(arr[0] as string),
  //     unitWeight: this.parsePotentiallyGroupedFloat(arr[1] as string),
  //     unitPrice: this.parsePotentiallyGroupedFloat(arr[2] as string),
  //     pricePer1tn: this.parsePotentiallyGroupedFloat(arr[3] as string),
  //     pricePer5tn: this.parsePotentiallyGroupedFloat(arr[4] as string),
  //     pricePer15tn: this.parsePotentiallyGroupedFloat(arr[5] as string),
  //     baseName: mapBaseName(arr[6] as string),
  //     name: arr[7] as string,
  //     size: arr[8] as string,
  //     surface: arr[9] as string,
  //     other: arr[10] as string,
  //     productGroup: arr[11] as string,
  //     length: this.parsePotentiallyGroupedFloat(arr[12] as string),
  //     warehouse: warehouse,
  //   };

  //   return createdPriceitem;
  // }

  parsePotentiallyGroupedFloat(stringValue: string) {
    return parseFloat(stringValue.replace(',', '.').replace(' ', ''));
  }

  async saveItems(rounds: Array<Priceitem>) {
    await this.priceitemsRepository.save(rounds);
  }
}
