import { FC } from 'react';
import { Link } from 'react-router-dom';
import { TPriceItemExtendedResponse } from '../../utils/types';
import block from 'bem-cn';
import './PriceItem.scss';

interface IPriceItemProps {
  item: TPriceItemExtendedResponse;
  // onClick: (item: TPriceItemExtendedResponse) => void;
}

const cnStyles = block('price-item-container');

export const PriceItem: FC<IPriceItemProps> = ({ item, onClick }) => {
  return (
    <Link 
      to={{ pathname: `/price/${item.id}` }}
      state={{ backgroundLocation: true }}
      className={cnStyles()}
    
    >
      {/* <article className={cnStyles('priceitem')} onClick={() => onClick(item)}> */}
      <article className={cnStyles('priceitem')}>
        <div className={cnStyles('name')}>{item.name}</div>
        <div className={cnStyles('size')}>{item.size}</div>
        <div className={cnStyles('price')}>{item.pricePer1tn.toLocaleString('ru-RU')} ₽</div>
      </article>
    </Link>
  );
};
