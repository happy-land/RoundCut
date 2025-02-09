import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { TPriceItemExtendedResponse } from '../../utils/types';
import block from 'bem-cn';
import { mapWeightToLevel } from '../../utils/markupMapping';
import { useGetMarkupByWarehouseIdQuery } from '../../services/markupApi';
import { useFetchItemQuery } from '../../services/priceApi';
import { useGetCutitemByParametersQuery } from '../../services/cutitemApi';
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
  const [markupValue, setMarkupValue] = useState<number>(0); // малотоннажность
  const [billetMarkupValue, setBilletMarkupValue] = useState<number>(0); // наценка на часть заготовки
  const [markupPrice, setMarkupPrice] = useState<number>(0); // цена с учетом малотоннажности
  const [billetPrice, setBilletPrice] = useState<number>(0);
  const [preCost, setPreCost] = useState<number>(0);
  const [preCostCoefApplied, setPreCostCoefApplied] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);

  const billetCoef = 1.1;
  const billetMarkup = 800;

  // queries
  // Найти в БД item с данными о его складе
  const { data: itemExtended } = useFetchItemQuery(item.id as number);
  const { data: markup } = useGetMarkupByWarehouseIdQuery(
    itemExtended?.warehouse?.id ?? skipToken,
  );

  const queryArgs = itemExtended?.warehouse?.id
    ? {
        warehouseId: itemExtended.warehouse.id,
        sizeNum: item.sizeNum,
      }
    : skipToken;

  const { data: cutitem } = useGetCutitemByParametersQuery(queryArgs, {
    skip: !queryArgs,
  });

  const handleChangeLength = (
    event: MouseEvent<HTMLButtonElement>,
    step: number,
  ) => {
    event.preventDefault();
    setLength((prev) => checkLengthConstraints(prev, step));
  };

  const checkLengthConstraints = (length: number, step: number) => {
    if (length + step < 0) {
      return 0;
    } else if (length + step > item.length) {
      return item.length;
    } else {
      return length + step;
    }
  };

  const isButtonDisabled = (length: number, step: number) => {
    if (length + step <= 0) {
      return true;
    } else if (length + step > item.length) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    // calculate weight
    const calculateWeight = (
      billetLength: number,
      totalLength: number,
      totalWeight: number,
    ) => {
      const weight = (billetLength * totalWeight) / totalLength;
      // console.log(`weight: ${Math.ceil(weight)}`);
      return Math.ceil(weight);
    };

    setWeight(() => calculateWeight(length, item.length, item.unitWeight));
  }, [length, item.length, item.unitWeight]);

  // малотоннажность
  useEffect(() => {
    const calculateMarkup = (weight: number): number => {
      let markupValue: number;
      if (weight < 1000 && markup) {
        const markupLevel = mapWeightToLevel(weight / 1000);
        const level = `level${markupLevel}`;
        markupValue = markup && markup[level];
      } else {
        markupValue = 0;
      }
      return markupValue;
    };

    setMarkupValue(() => calculateMarkup(weight));
  }, [weight, markup]);

  // цена с учетом малотоннажности
  useEffect(() => {
    const calculateMarkupPrice = (price: number, markupValue: number) => {
      return Number(Number(price) + Number(markupValue));
    };

    setMarkupPrice(() => calculateMarkupPrice(item.pricePer1tn, markupValue));
  }, [item.pricePer1tn, markupValue]);

  useEffect(() => {
    // calculate price with coefficient applied
    const calculatePrice = (markupPrice: number, weight: number) => {
      let billetPriceCoefApplied: number = markupPrice * billetCoef;

      const preCost = (markupPrice * weight) / 1000; // стоимость заготовки без наценки на часть
      const preCostCoefApplied = (billetPriceCoefApplied * weight) / 1000; // стоимость заготовки с учетом наценки на часть

      setPreCost(() => preCost);
      setPreCostCoefApplied(() => preCostCoefApplied);

      // если разница между стоимостью с учетом наценки на часть и без нее менее [billetMarkup] рублей,
      // то добавляем к стоимости billetMarkup рублей и рассчитываем новую цену

      if (preCostCoefApplied - preCost < billetMarkup) {
        // billetMarkup - это минимальная наценка на часть
        const cost = preCost + billetMarkup;
        billetPriceCoefApplied = (cost * 1000) / weight;
      }

      return Math.round(billetPriceCoefApplied);
    };
    setBilletPrice(() => calculatePrice(markupPrice, weight));
  }, [markupPrice, weight]);

  useEffect(() => {
    // calculate cost
    const calculateCost = (billetPrice: number, weight: number) => {
      return (billetPrice * weight) / 1000;
    };

    setCost(() => calculateCost(billetPrice, weight));
  }, [billetPrice, weight]);

  return (
    <article className={cnStyles('cell')}>
      <p className={cnStyles('stat')}>
        Имя из БД: {itemExtended?.warehouse?.id} Наценка{' '}
        {markupValue ? markupValue : 0}
      </p>
      <h2 className={cnStyles('title')}>
        {item.name} &#8960; {item.size}
      </h2>
      {/* <p className={cnStyles('price')}>{markupValue ? Number(item.pricePer1tn) + Number(markupValue) : item.pricePer1tn}</p> */}
      <p className={cnStyles('price')}>
        Цена: {weight > 0 ? billetPrice : markupPrice}
      </p>
      <p className={cnStyles('price')}>
        Стоимость (без 10%): {billetPrice ? preCost.toFixed(2) : 0}
      </p>
      <p className={cnStyles('price')}>
        Стоимость (+ 10%): {billetPrice ? preCostCoefApplied.toFixed(2) : 0}
      </p>
      <p className={cnStyles('price')}>
        Стоимость: {weight > 0 ? cost.toFixed(2) : 0}
      </p>
      <p className={cnStyles('item-label')}>
        ({item.baseName}) - {item.sizeNum} {item.length} - - {weight.toFixed(2)}{' '}
        кг - Стоимость: {cost.toFixed(2)} руб
      </p>
      <p>{cutitem?.name}</p>
      <div className={cnStyles('actions')}>
        <button
          className={cnStyles('button')}
          disabled={isButtonDisabled(length, -1)}
          onClick={(event) => handleChangeLength(event, -1)}
        >
          -1000мм
        </button>
        <button
          className={cnStyles('button')}
          disabled={isButtonDisabled(length, -0.1)}
          onClick={(event) => handleChangeLength(event, -0.1)}
        >
          -100мм
        </button>
        <button
          className={cnStyles('button')}
          disabled={isButtonDisabled(length, -0.01)}
          onClick={(event) => handleChangeLength(event, -0.01)}
        >
          -10мм
        </button>
        <button
          className={cnStyles('button')}
          disabled={isButtonDisabled(length, -0.001)}
          onClick={(event) => handleChangeLength(event, -0.001)}
        >
          -1мм
        </button>
        <span className={cnStyles('length')}>{length.toFixed(3)} м</span>
        <button
          className={cnStyles('button')}
          disabled={isButtonDisabled(length, +0.001)}
          onClick={(event) => handleChangeLength(event, +0.001)}
        >
          +1мм
        </button>
        <button
          className={cnStyles('button')}
          disabled={isButtonDisabled(length, +0.01)}
          onClick={(event) => handleChangeLength(event, +0.01)}
        >
          +10мм
        </button>
        <button
          className={cnStyles('button')}
          disabled={isButtonDisabled(length, +0.1)}
          onClick={(event) => handleChangeLength(event, +0.1)}
        >
          +100мм
        </button>
        <button
          className={cnStyles('button')}
          disabled={isButtonDisabled(length, +1)}
          onClick={(event) => handleChangeLength(event, +1)}
        >
          +1000мм
        </button>
      </div>
    </article>
  );
};

export default BilletCell;
