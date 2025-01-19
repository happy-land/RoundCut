import React, { FC, ChangeEvent, MouseEvent, useState } from 'react';
import {
  TPriceItem,
  TPriceItemResponse,
  TPriceItemExtendedResponse,
} from '../../utils/types';
import { PriceItem } from './PriceItem';
import block from 'bem-cn';
import './PriceList.scss';
import {
  useDeleteAllItemsMutation,
  useDeleteItemMutation,
  useFetchItemsQuery,
  // useFetchCsvPriceMutation,
  useExtractDataMutation,
  useItemMutation,
  useItemsMutation,
} from '../../services/priceApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addItem } from '../../features/cut/cutSlice';
// import { PAGE_SIZE } from '../../utils/constants';
import { convertToPriceItem, extractFirstWord } from '../../utils/utils';
import { selectWarehouse } from '../../features/warehouse/warehouseSlice';

interface IPriceListListProps {
  type: 'user' | 'admin';
}

const cnStyles = block('price');

export const PriceList: FC<IPriceListListProps> = ({ type }) => {
  const dispatch = useAppDispatch();
  const { warehouseId } = useAppSelector(selectWarehouse);

  const [csvData, setCsvData] = useState<string[]>([]);

  // TODO: сделать тип TPriceItem, который будет отличаться от TPriceItemResponse
  const [itemsToExport, setItemsToExport] = useState<TPriceItemResponse[]>([]);

  // Значение uniqueItemNames определяется при нажатии на кнопку "Уникальные названия"
  const [uniqueItemNames, setUniqueItemNames] = useState<string[]>([]);

  // Значение uniqueItemNames определяется при нажатии на кнопку "Уникальные длины"
  const [uniqueItemLengths, setUniqueItemLengths] = useState<string[]>([]);

  const [inputName, setInputName] = useState<string>('Круг');

  // queries
  // тут задать ()  номер айди склада, взять из хранилища
  const { data: items = [], refetch } = useFetchItemsQuery(warehouseId);

  // mutations
  const [deleteItem] = useDeleteItemMutation();
  const [deleteAllItems] = useDeleteAllItemsMutation();
  const [extractData] = useExtractDataMutation();
  const [uploadItem] = useItemMutation();
  const [uploadItems] = useItemsMutation();

  const itemsExtended: Array<TPriceItemExtendedResponse> = items.map(
    (item: TPriceItemResponse) => {
      // запишем в поле sizeNum значение диаметра круга
      const indexOfM = item.size.indexOf('м');
      const sizeNum: number = parseInt(item.size.slice(0, indexOfM));
      // запишем в поле nameExt имя вида 'Круг Ст20'  (без 3ГП которое иногда встречается в прайсе)
      const indexOfSecondSpace = item.name.indexOf(
        ' ',
        item.name.indexOf(' ') + 1,
      );
      let nameExt: string;
      if (indexOfSecondSpace === -1) {
        // то есть второго пробела в строке нет
        nameExt = item.name;
      } else {
        // второй пробел в строке есть
        nameExt = item.name.slice(0, indexOfSecondSpace);
      }

      return {
        ...item,
        nameExt,
        sizeNum,
        indexOfSecondSpace,
      };
    },
  );

  const orderedItems = itemsExtended
    .slice()
    .sort((a, b) => a.sizeNum - b.sizeNum)
    .sort((a, b) => a.nameExt.localeCompare(b.nameExt));

  // const filteredItems = orderedItems.map((item) => {
  //   if (item.name.includes(inputName)) {
  //     return item;
  //   } else {
  //     filteredItems.sp
  //   }
  // });

  // console.log(inputName);
  // console.log(filteredItems.length);

  const onItemClick = (item: TPriceItemExtendedResponse): void => {
    console.log(item);
    // сделать dispatch addItem
    dispatch(addItem({ item: item }));
  };

  const content = (
    <ul className={cnStyles('items-list')}>
      {orderedItems.map((item: TPriceItemExtendedResponse, index: number) => (
        <React.Fragment key={index}>
          {item.name.toLowerCase().includes(inputName.toLowerCase()) && (
            <li className={cnStyles('list-item')}>
              <PriceItem
                item={item}
                onClick={() => onItemClick(item)}
              />
            </li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );

  // const handleDeleteItem = async (
  //   event: MouseEvent<HTMLButtonElement>,
  //   item: TPriceItemExtendedResponse,
  // ): Promise<void> => {
  //   event.preventDefault();
  //   console.log(item);
  //   const res = await deleteItem(item.id);
  //   console.log(res);
  // };

  const handleDeleteAllItems = async (
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    event.preventDefault();
    console.log('remove all');
    const res = await deleteAllItems(event);
    console.log(res);
  };

  const handleExtractDataIntoArray = async (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    await extractData()
      .unwrap()
      .then((res) => {
        console.log(res);
        setCsvData(res);
      });
  };

  const handleShowUniqueNames = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const uniqueItemNames: string[] = [];

    csvData.map((item) => {
      const arr: string[] = item.split(';');
      if (!uniqueItemNames.find((uniqueName) => uniqueName === arr[7])) {
        uniqueItemNames.push(arr[7]);
      }
    });
    setUniqueItemNames(uniqueItemNames);
  };

  const handleShowUniqueLengths = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const uniqueItemLengths: string[] = [];

    csvData.map((item) => {
      const arr: string[] = item.split(';');
      if (!uniqueItemLengths.find((uniqueLength) => uniqueLength === arr[12])) {
        uniqueItemLengths.push(arr[12]);
      }
    });
    setUniqueItemLengths(uniqueItemLengths);
  };

  const handleMapCategoryToPriceItem = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    const arrToExport: TPriceItemResponse[] = csvData.map((item) => {
      const arr: string[] = item.split(';');
      const catName = extractFirstWord(arr[7]);
      if (arr[7].includes('калиброванный')) {
        arr.splice(11, 1);
      }

      if (arr[12].includes('Лист г/к')) {
        arr.splice(11, 1);
        console.log(arr);
      }
      arr.push(catName);
      return convertToPriceItem(arr);
    });
    // TODO: раскомментировать
    setItemsToExport(arrToExport);
  };

  // const handleUploadItem = (event: MouseEvent<HTMLButtonElement>, item: TPriceItemResponse) => {
  //   event.preventDefault();
  //   console.log(item);
  //   uploadItem(item);
  // };

  const handleUploadItems = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log(itemsToExport);
    uploadItems(itemsToExport);
  };

  const handleRefetch = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    refetch();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setInputName(event.target.value);
  };

  return (
    <div className={cnStyles()}>
      <h1 className={cnStyles('title')}>Прайс</h1>
      {type === 'admin' && (
        <div className={cnStyles('price-buttons')}>
          <button
            className={cnStyles('button')}
            onClick={(event) => handleDeleteAllItems(event)}
            disabled={items.length === 0}
          >
            Удалить все строки из БД
          </button>
          <button
            className={cnStyles('button')}
            // onClick={(event) => handleLoadPriceFromCSV(event)}
            onClick={(event) => handleExtractDataIntoArray(event)}
            disabled={items.length > 0}
          >
            Выгрузить прайс в массив
          </button>
          <button
            className={cnStyles('button')}
            onClick={(event) => handleRefetch(event)}
          >
            Обновить
          </button>
        </div>
      )}
      {csvData.length > 0 && (
        <div>
          <p>В массив выгружено {csvData.length} строк</p>
          <button
            className={cnStyles('button')}
            onClick={(event) => handleShowUniqueNames(event)}
          >
            Уникальные названия
          </button>
          <button
            className={cnStyles('button')}
            onClick={(event) => handleShowUniqueLengths(event)}
          >
            Уникальные длины
          </button>
          <button
            className={cnStyles('button')}
            onClick={(event) => handleMapCategoryToPriceItem(event)}
          >
            Определить категорию
          </button>
          <button
            className={cnStyles('button')}
            onClick={(event) => handleUploadItems(event)}
          >
            +++
          </button>
          {uniqueItemNames.map((uniqueName, index) => (
            <p key={index}>
              {index}. {uniqueName}
            </p>
          ))}
          {uniqueItemLengths.map((uniqueLength, index) => (
            <p key={index}>
              {index}. {uniqueLength}
            </p>
          ))}
          {itemsToExport.slice(15580, 15590).map((item, index) => (
            <div key={index}>
              <p>
                {index}. {item.name} {item.size} {item.baseName} {item.catName}
              </p>
              <button
                className={cnStyles('button')}
                // onClick={(event) => handleUploadItem(event, item)}
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}
      <p>{items.length} строк и страниц</p>
      <input
        className={cnStyles('input')}
        type="text"
        name="input"
        value={inputName ?? ''}
        onChange={handleInputChange}
        placeholder="Найти позицию"
        required
      />
      {content && (
        <section className={cnStyles('content-section')}>{content}</section>
      )}
    </div>
  );
};
