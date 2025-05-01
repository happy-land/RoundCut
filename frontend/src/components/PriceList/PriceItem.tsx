import { FC } from 'react';
import { TPriceItemExtended } from '../../utils/types';
import { Link } from 'react-router-dom';
import block from 'bem-cn';
import './PriceItem.scss';

interface IPriceItemProps {
  item: TPriceItemExtended;
  onClick: (item: TPriceItemExtended) => void;
}

const cnStyles = block('price-item-container');

export const PriceItem: FC<IPriceItemProps> = ({ item, onClick }) => {
  return (
    // <Link to={`/price/${item.id}`} className={cnStyles()}>
    <article className={cnStyles('priceitem')} onClick={() => onClick(item)}>
      <p className={cnStyles('column').mix('width-80')}>{item.name}</p>
      {/* <p className={cnStyles('column')}>{item.nameExt}</p> */}
      <p className={cnStyles('column').mix('price-item-container__size')}>{item.size}</p>
      <p className={cnStyles('column').mix('price-item-container__surface')}>
        {item.surface}
      </p>
      <p className={cnStyles('column')}>{item.unitWeight}</p>
      {/* <p className={cnStyles('column').mix('link__other')}>{item.other}</p> */}
      <p className={cnStyles('column')}>{item.pricePer1tn}</p>
    </article>
    // </Link>
  );
};
