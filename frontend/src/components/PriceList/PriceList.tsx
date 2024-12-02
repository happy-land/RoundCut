import { FC, MouseEvent, useState } from 'react';

import { TPriceItem, TPriceItemExtended } from '../../utils/types';
// import { useAppDispatch, useAppSelector } from '../../app/hooks';
// import { fetchItems, selectAllItems } from './priceitemsSlice';
import { PriceItem } from './PriceItem';
import block from 'bem-cn';
import './PriceList.scss';
import {
  useDeleteAllItemsMutation,
  useDeleteItemMutation,
  useFetchItemsQuery,
  useFetchCsvPriceMutation,
} from '../../services/priceApi';
import { useAppDispatch } from '../../app/hooks';
import { addItem } from '../../features/cut/cutSlice';
import { PAGE_SIZE } from '../../utils/constants';

interface IPriceListListProps {
  type: 'user' | 'admin';
}

const cnStyles = block('price');

export const PriceList: FC<IPriceListListProps> = ({ type }) => {
  const dispatch = useAppDispatch();

  const [skip, setSkip] = useState(false);
  const [status, setStatus] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [query, setQuery] = useState(undefined);

  // queries
  const {
    data: items = [],
    isLoading,
    isSuccess,
    refetch,
  } = useFetchItemsQuery(query);

  // mutations
  const [deleteItem] = useDeleteItemMutation();
  const [deleteAllItems] = useDeleteAllItemsMutation();
  const [fetchCsvPrice] = useFetchCsvPriceMutation();

  // if (isLoading) {
  //   console.log('loading...');
  // }
  // if (isSuccess) {
  //   console.log(items);
  // }

  const itemsExtended: Array<TPriceItemExtended> = items.map(
    (item: TPriceItem) => {
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

  const onItemClick = (item: TPriceItemExtended): void => {
    console.log(item);
    // сделать dispatch addItem
    dispatch(addItem({ item: item }));
  };

  const content = (
    <ul className={cnStyles('items-list')}>
      {orderedItems.map((item: TPriceItemExtended, index: number) => (
        <li className={cnStyles('list-item')} key={index}>
          <PriceItem
            key={index}
            item={item}
            onClick={() => onItemClick(item)}
          />
          {type === 'admin' && (
            <button onClick={(event) => handleDeleteItem(event, item)}>
              X
            </button>
          )}
        </li>
      ))}
    </ul>
  );
  // }


  const handleDeleteItem = async (
    event: MouseEvent<HTMLButtonElement>,
    item: TPriceItemExtended,
  ): Promise<void> => {
    event.preventDefault();
    console.log(item);
    const res = await deleteItem(item.id);
    console.log(res);
  };

  const handleDeleteAllItems = async (
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    event.preventDefault();
    console.log('remove all');
    const res = await deleteAllItems(event);
    console.log(res);
  };

  const handleLoadPriceFromCSV = async (
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    event.preventDefault();
    console.log(`before fetchCsvPrice items = ${items.length}`);
    const res = await fetchCsvPrice()
      // console.log(res);
      // console.log(`after fetchCsvPrice items = ${items.length}`);
      .unwrap()
      .then((res) => {
        console.log(`after fetchCsvPrice items = ${items.length}`);
        console.log(res);
        setStatus(() => 'Прайс выгружен');
        refetch();
        console.log(`after refetch fetchCsvPrice items = ${items.length}`);
      });
  };

  const handleRefetch = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    refetch();
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
            Удалить все строки
          </button>
          <button
            className={cnStyles('button')}
            onClick={(event) => handleLoadPriceFromCSV(event)}
            disabled={items.length > 0}
          >
            Выгрузить прайс
          </button>
          <button
            className={cnStyles('button')}
            onClick={(event) => handleRefetch(event)}
          >
            Обновить
          </button>
        </div>
      )}
      <p>{items.length} строк и страниц</p>
      {content && (
        <section className={cnStyles('content-section')}>{content}</section>
      )}
    </div>
  );
};
