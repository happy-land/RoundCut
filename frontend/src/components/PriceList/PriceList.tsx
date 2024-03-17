import { FC } from 'react';
import { useSelector } from '../../hooks';

import './PriceList.scss';
import block from 'bem-cn';
import { TPriceItem } from '../../services/types/data';

export interface IPriceListProps {
}

const cnStyles = block('price');

export const PriceList: FC = (props: IPriceListProps) => {

  const { items } = useSelector((store) => store.priceitems);

  const handleUpdate = (): void => {

  }

  return (
    <div className={cnStyles()}>
      <div className={cnStyles('actions-panel')}>
      <button className={cnStyles('load-remote-btn')} onClick={handleUpdate}>
        Обновить прайс
      </button>
      </div>
      <ul className={cnStyles('items-list')}>
        {(items as Array<TPriceItem>).map((item: TPriceItem, index: number) => (
          <li>
            {item.name}
          </li>
        )}
      </ul>
    </div>
  );
}
