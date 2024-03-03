import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import csv from 'csv-parser';
import axios from 'axios';
import * as iconv from 'iconv-lite';

@Injectable()
export class CsvService {
  async fetchCsvFile() {
    console.log('Загружаем CSV...');
    try {
      const { data } = await axios.get(
        // 'https://www.metallotorg.ru/import/prise_last.csv',
        'http://localhost:3002/csv/prise_last.csv',
        {
          responseType: 'arraybuffer',
          responseEncoding: 'binary',
        },
      );
      const buf = iconv.decode(Buffer.from(data), 'win1251');
      // console.log(buf);
      const rounds: Array<string> = this.parseString(buf);
      return rounds;
    } catch (error) {
      throw new Error(error);
    }
  }

  // parse
  parseString(buffer: string): Array<string> {
    const arr: Array<string> = buffer.split('\n');
    const rounds: Array<string> = [];
    arr.map((item) => {
      if (this.isRound(item)) {
        rounds.push(item);
      }
    });
    // console.log(krugi.length);
    return rounds;
  }

  isRound(item: string): boolean {
    const arr: Array<string> = item.split(';');
    // console.log(arr[7]);
    if (arr[7].includes('Круг') && arr[6].includes('УГЛИ')) {
      return true;
    }
    return false;
  }
}
