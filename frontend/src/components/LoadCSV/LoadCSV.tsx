import React from 'react';
import block from 'bem-cn';
import { Link } from 'react-router-dom';
import { usePapaParse } from 'react-papaparse';
import './LoadCSV.scss';
import { proxyPathToCSV, remotePathToCSV } from '../../utils/constants';
import axios from 'axios';
import iconv from 'iconv-lite';

const cnStyles = block('load-csv');

type priceItem = {
  name: string;
};

export const LoadCSV = () => {
  const { readRemoteFile } = usePapaParse();

  const handleClick = () => {
    console.log('clicked!', proxyPathToCSV);
    readRemoteFile(proxyPathToCSV, {
      complete: (results, file) => {
        console.log('-----------');
        console.log('Results:', results);
        console.log('File:', file);
        console.log('-----------');
      },
      download: true,
      skipEmptyLines: true,
    });
  };

  const handleParseLocalFile = async (
    evt: React.ChangeEvent<HTMLInputElement>,
  ) => {
    console.log('sdds');
    const file = evt.target.files ? evt.target.files[0] : undefined;
    const reader = new FileReader();

    if (file) {
      console.log(file);
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');

        reader.onload = function () {
          console.log(reader.result);
        };
      }
    }
  };

  const fetchCsvData = () => {
    axios
      .get('http://localhost:3000/import/prise_last.csv', {
        // responseType: 'arraybuffer',res
        responseType: 'text',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'identity',
        },
        params: {
          trophies: true,
        },
      })
      .then((response) => {
        console.log('response: ', response.data);
        console.log(typeof response.data);

        // const data = iconv.decode(response.data, 'win1251', );
        // console.log('data: ', data);

        // Должно работать в NodeJS и не работает в React
        // response.pipe(iconv.decodeStream('win1251')).collect((err: any, decodedBody: any) => {
        //   console.log(decodedBody);
        // });
      })
      .catch((error) => {
        console.error('Error fetching CSV data:', error);
      });
  };

  return (
    <div className={cnStyles()}>
      {/* <Link to="#">Загрузить CSV файл</Link> */}
      <button className={cnStyles('load-remote-btn')} onClick={fetchCsvData}>
        Загрузить удаленный CSV файл
      </button>

      <label htmlFor="myFile">
        <div className={cnStyles('button')}>
          <p className={cnStyles('button-text')}>Выберите файл</p>
        </div>
        <input
          type="file"
          className={cnStyles('input')}
          name="myFile"
          id="myFile"
          accept=".csv"
          onChange={handleParseLocalFile}
        />
      </label>
    </div>
  );
};
