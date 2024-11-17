import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { TPriceItemExtended } from '../../utils/types';
import block from 'bem-cn';
import { mapWeightToLevel } from '../../utils/markupMapping';

interface IBilletCellProps {
  item: TPriceItemExtended;
  // onCloseClick: () => void;
}

const cnStyles = block('billet-cell-container');

const BilletCell: FC<IBilletCellProps> = ({ item /*onCloseClick*/ }) => {
  const [length, setLength] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [markupLevel, setMarkupLevel] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);

  const handleChangeLength = (
    event: MouseEvent<HTMLButtonElement>,
    step: number,
  ) => {
    event.preventDefault();
    setLength((prev) => prev + step);
  };

  useEffect(() => {
    console.log('useEffect invoked');
    setWeight(() => calculateWeight(length, item.length, item.unitWeight));
  }, [length, item.length, item.unitWeight]);

  useEffect(() => {
    setCost(() => calculateCost(item.pricePer1tn, weight));
  }, [item.pricePer1tn, weight]);

  const calculateWeight = (
    billetLength: number,
    totalLength: number,
    totalWeight: number,
  ) => {
    return (billetLength * totalWeight) / totalLength;
  };

  // simple version
  const calculateCost = (price: number, weight: number) => {
    const markupLevel = mapWeightToLevel(weight/1000);
    console.log(weight);

    
    console.log(markupLevel);
    return price * weight / 1000;
  };

  return (
    <article className={cnStyles('cell')}>
      <p className={cnStyles('item-label')}>
        {item.name} ({item.baseName}) - {item.size} {item.length} - {item.pricePer1tn} -{' '}
        {weight.toFixed(0)} кг - Стоимость: {cost.toFixed(2)} руб
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
