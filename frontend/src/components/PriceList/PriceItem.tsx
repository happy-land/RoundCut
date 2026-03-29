import { FC } from 'react';
import { Link } from 'react-router-dom';
import { TPriceItemExtendedResponse } from '../../utils/types';
import block from 'bem-cn';
import './PriceItem.scss';

interface IPriceItemProps {
  item: TPriceItemExtendedResponse;
}

const cnStyles = block('price-item');

export const PriceItem: FC<IPriceItemProps> = ({ item }) => {
  return (
    <Link
      to={{ pathname: `/price/${item.id}` }}
      state={{ backgroundLocation: true }}
      className={cnStyles()}
    >
      <article className={cnStyles('card')}>
        {/* Левая часть: название + мета-бейджи */}
        <div className={cnStyles('left')}>
          <span className={cnStyles('name')}>{item.nameExt}</span>
          <div className={cnStyles('badges')}>
            {item.other && (
              <span className={cnStyles('badge', 'other')}>{item.other}</span>
            )}
            {item.surface && (
              <span className={cnStyles('badge', 'surface')}>{item.surface}</span>
            )}
          </div>
        </div>

        {/* Средняя колонка: вес 1 шт */}
        <div className={cnStyles('col-weight')}>
          {item.unitWeight > 0 && (
            <>
              <span className={cnStyles('col-weight__value')}>{item.unitWeight}</span>
              <span className={cnStyles('col-weight__unit')}>кг/шт</span>
            </>
          )}
        </div>

        {/* Правая часть: диаметр + цены */}
        <div className={cnStyles('right')}>
          <span className={cnStyles('size')}>{item.size}</span>
          <div className={cnStyles('prices')}>
            <span className={cnStyles('price-main')}>
              {item.pricePer1tn.toLocaleString('ru-RU')} ₽/т
            </span>
            {item.pricePer5tn > 0 && item.pricePer5tn !== item.pricePer1tn && (
              <span className={cnStyles('price-sub')}>
                от 5т: {item.pricePer5tn.toLocaleString('ru-RU')} ₽
              </span>
            )}
            {item.pricePer15tn > 0 && item.pricePer15tn !== item.pricePer5tn && (
              <span className={cnStyles('price-sub')}>
                от 15т: {item.pricePer15tn.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};
