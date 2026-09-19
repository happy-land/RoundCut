import { FC } from 'react';
import { Link } from 'react-router-dom';
import { TPriceItemExtendedResponse } from '../../utils/types';
import block from 'bem-cn';
import './PriceItem.scss';

interface IPriceItemProps {
  item: TPriceItemExtendedResponse;
  warehouseName: string;
}

const cnStyles = block('price-item');

const CUT_ICONS: Record<string, string> = {
  bandsaw:    '🪚',
  cutoff:     '⭕',
  gas:        '🔥',
  guillotine: '✂️',
  plasma:     '⚡',
  thermal:    '♨️',
  laser:      '🎯',
};

const CUT_LABELS: Record<string, string> = {
  bandsaw:    'Лентопильный станок',
  cutoff:     'Отрезной диск',
  gas:        'Газовая резка',
  guillotine: 'Гильотина',
  plasma:     'Плазма',
  thermal:    'Термическая резка',
  laser:      'Лазер',
};

export const PriceItem: FC<IPriceItemProps> = ({ item, warehouseName }) => {
  const cuts = item.availableCuts ?? [];
  return (
    <Link
      to={{ pathname: `/price/${item.id}` }}
      state={{ backgroundLocation: true }}
      className={cnStyles()}
    >
      <article className={cnStyles('card')}>
        {/* Левая часть: название + мета-бейджи */}
        <div className={cnStyles('left')}>
          <span className={cnStyles('name')}>
            {item.nameExt}
            {item.size && <span className={cnStyles('name-size')}> {item.size}</span>}
          </span>
          <div className={cnStyles('badges')}>
            {item.other && (
              <span className={cnStyles('badge', 'other')}>{item.other}</span>
            )}
            {item.surface && (
              <span className={cnStyles('badge', 'surface')}>{item.surface}</span>
            )}
          </div>
        </div>

        {/* Средняя колонка: размер (только планшет+) */}
        <div className={cnStyles('col-size')}>
          <span className={cnStyles('size')}>{item.size}</span>
        </div>

        {/* Колонка длины (только планшет+) */}
        {item.length > 0 && (
          <div className={cnStyles('col-length')}>
            <span className={cnStyles('length-value')}>{item.length}</span>
            <span className={cnStyles('length-unit')}>м</span>
          </div>
        )}

        {/* Колонка склада (только планшет+) */}
        <div className={cnStyles('col-warehouse')}>
          <span className={cnStyles('warehouse-name')}>{warehouseName}</span>
        </div>

        {/* Колонка резки (только планшет+) */}
        <div className={cnStyles('col-cuts')}>
          {cuts.map((code) => (
            <span key={code} className={cnStyles('badge', 'cut')} title={CUT_LABELS[code] ?? code}>
              {CUT_ICONS[code] ?? code}
            </span>
          ))}
        </div>

        {/* Правая часть: вес 1 шт + цены */}
        <div className={cnStyles('right')}>
          {item.unitWeight > 0 && (
            <div className={cnStyles('col-weight')}>
              <span className={cnStyles('col-weight__value')}>{item.unitWeight}</span>
              <span className={cnStyles('col-weight__unit')}>кг/шт</span>
            </div>
          )}
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

        {/* Footer-строка с деталями (только мобилка) */}
        <div className={cnStyles('mobile-footer')}>
          <div className={cnStyles('mobile-footer__item')}>
            <span className={cnStyles('mobile-footer__label')}>диаметр</span>
            <span className={cnStyles('mobile-footer__value')}>{item.size}</span>
          </div>
          {item.length > 0 && (
            <div className={cnStyles('mobile-footer__item')}>
              <span className={cnStyles('mobile-footer__label')}>длина</span>
              <span className={cnStyles('mobile-footer__value')}>{item.length} м</span>
            </div>
          )}
          <div className={cnStyles('mobile-footer__item')}>
            <span className={cnStyles('mobile-footer__label')}>📦</span>
            <span className={cnStyles('mobile-footer__value')}>{warehouseName}</span>
          </div>
          {cuts.length > 0 && (
            <div className={cnStyles('mobile-footer__item')}>
              <span className={cnStyles('mobile-footer__label')}>резка</span>
              <span className={cnStyles('mobile-footer__value')}>
                {cuts.map((code) => CUT_ICONS[code] ?? code).join(' ')}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};
