import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { TPriceItemExtendedResponse } from '../../utils/types';
import block from 'bem-cn';
import { mapWeightToLevel } from '../../utils/markupMapping';
import { useGetMarkupByWarehouseIdQuery } from '../../services/markupApi';
import { useFetchItemQuery } from '../../services/priceApi';
import { skipToken } from '@reduxjs/toolkit/query';
import './BilletCell.scss';

interface IBilletCellProps {
  item: TPriceItemExtendedResponse;
  // onCloseClick: () => void;
}

const cnStyles = block('billet-cell-container');

const BilletCell: FC<IBilletCellProps> = ({ item /*onCloseClick*/ }) => {
  const [length, setLength] = useState<number>(0); // длина заготовки
  const [weight, setWeight] = useState<number>(0); // вес заготовки
  const [markupValue, setMarkupValue] = useState<number>(0);
  // const [markupLevelStr, setMarkupLevelStr] = useState<string>('');
  const [cost, setCost] = useState<number>(0);

  // queries
  // Найти в БД item с данными о его складе
  const { data: itemExtended, isSuccess } = useFetchItemQuery(
    item.id as number,
  );
  const { data: markup } = useGetMarkupByWarehouseIdQuery(
    itemExtended?.warehouse?.id ?? skipToken,
  );

  const handleChangeLength = (
    event: MouseEvent<HTMLButtonElement>,
    step: number,
  ) => {
    event.preventDefault();
    setLength((prev) => prev + step);
  };

  useEffect(() => {
    // console.log(`useEffect1 invoked ${item.unitWeight}`);
    setWeight(() => calculateWeight(length, item.length, item.unitWeight));
  }, [length, item.length, item.unitWeight]);

  useEffect(() => {
    // console.log(`useEffect2 invoked ${weight}`);
    setCost(() => calculateCost(item.pricePer1tn, weight));
  }, [item.pricePer1tn, weight]);

  const calculateWeight = (
    billetLength: number,
    totalLength: number,
    totalWeight: number,
  ) => {
    // console.log(`${billetLength} ${totalLength} ${totalLength}`);
    return (billetLength * totalWeight) / totalLength;
  };

  // simple version
  const calculateCost = (price: number, weight: number) => {
    let markupValue: number;
    if (weight < 1000) {
      const markupLevel = mapWeightToLevel(weight / 1000);
      const level = `level${markupLevel}`;
      markupValue = markup && markup[level];
    } else {
      markupValue = 0;
    }
    console.log(markupValue);
    
    setMarkupValue(markupValue);
    // return markupValue ? ((Number(price) + markupValue) * weight) / 1000 : 0;
    return weight ? ((Number(price) + markupValue) * weight) / 1000 : 0;
  };

  return (
    <article className={cnStyles('cell')}>
      <p className={cnStyles('stat')}>
        Имя из БД: {itemExtended?.warehouse?.id} Наценка {markupValue ? markupValue : 0}
      </p>
      <h2 className={cnStyles('title')}>{item.name} &#8960; {item.size}</h2>
      <p className={cnStyles('price')}>{markupValue ? Number(item.pricePer1tn) + Number(markupValue) : item.pricePer1tn}</p>
      <p className={cnStyles('item-label')}>
         ({item.baseName}) - {item.size} {item.length} -{' '}
         - {weight.toFixed(0)} кг - Стоимость:{' '}
        {cost.toFixed(2)} руб
      </p>
      <div className={cnStyles('actions')}>
        <button onClick={(event) => handleChangeLength(event, -0.1)}>
          -100мм
        </button>
        <span className={cnStyles('length')}>
          заготовка {length.toFixed(3)} м
        </span>
        <button onClick={(event) => handleChangeLength(event, +0.1)}>
          +100мм
        </button>
      </div>
    </article>
  );
};

export default BilletCell;
