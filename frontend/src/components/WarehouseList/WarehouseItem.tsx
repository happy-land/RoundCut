import React, { FC } from 'react';
import block from 'bem-cn';
import './WarehouseItem.scss';
import { TWarehouse } from '../../utils/types';
import { Link } from 'react-router-dom';
import { useGetMarkupByWarehouseIdQuery } from '../../services/markupApi';

interface IWarehouseItemProps {
  item: TWarehouse;
  onClick: (item: TWarehouse) => void;
}

const cnStyles = block('warehouse-item-container');

const WarehouseItem: FC<IWarehouseItemProps> = ({ item, onClick }) => {
  // queries
  const { data: markup } = useGetMarkupByWarehouseIdQuery(item.id);

  return (
    <article
      className={cnStyles('warehouseitem')}
      onClick={() => onClick!(item)}
    >
      <Link
        to={{
          pathname: `/admin/warehouse/${item.id}`,
        }}
        className={cnStyles('name')}
      >
        {item.name}
      </Link>

      <section className={cnStyles('markup')}>
        {markup && (
          <ul className={cnStyles('items-list')}>
            <li className={cnStyles('level')}>{markup.level1}</li>
            <li className={cnStyles('level')}>{markup.level2}</li>
            <li className={cnStyles('level')}>{markup.level3}</li>
            <li className={cnStyles('level')}>{markup.level4}</li>
            <li className={cnStyles('level')}>{markup.level5}</li>
            <li className={cnStyles('level')}>{markup.level6}</li>
            <li className={cnStyles('level')}>{markup.level7}</li>
            <li className={cnStyles('level')}>{markup.level8}</li>
          </ul>
        )}
      </section>
    </article>
  );
};

export default WarehouseItem;
