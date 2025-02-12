import React, { ChangeEvent } from 'react';
import block from 'bem-cn';
import './WarehouseSelector.scss';
import { NavLink } from 'react-router-dom';
import { setWarehouse } from '../../features/warehouse/warehouseSlice';
import { useAppDispatch } from '../../app/hooks';

const cnStyles = block('warehouse-selector');

const WarehouseSelector = () => {

  const dispath = useAppDispatch();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value);
    // по умолчанию выбран склад Электроугли и в БД его id=202
    // в warehouseSlice defaultValue=202
    dispath(setWarehouse({ warehouseId: Number(event.target.value) }))
  };

  return (
    <section className={cnStyles()}>
      <nav className={cnStyles('warehouses')}>
        <NavLink to="/"></NavLink>
      </nav>
      <select className={cnStyles('warehouses-select')} onChange={handleChange}>
        <option className={cnStyles('item')} value={202}>
          Электроугли
        </option>
        <option className={cnStyles('item')} value={152}>
          Лобня
        </option>
        <option className={cnStyles('item')} value={153}>
          Брянск
        </option>
      </select>
    </section>
  );
};

export default WarehouseSelector;
