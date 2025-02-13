import { ChangeEvent } from 'react';
import block from 'bem-cn';
import './WarehouseSelector.scss';
import { NavLink } from 'react-router-dom';
import { setWarehouse } from '../../features/warehouse/warehouseSlice';
import { useAppDispatch } from '../../app/hooks';
import { useFetchWarehousesQuery } from '../../services/warehouseApi';
import { Listbox } from '@headlessui/react';

const cnStyles = block('warehouse-selector');

const WarehouseSelector = () => {
  const dispatch = useAppDispatch();
  const { data: warehouses, error, isLoading } = useFetchWarehousesQuery(0);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value);
    // по умолчанию выбран склад Электроугли и в БД его id=202
    // в warehouseSlice defaultValue=202
    dispatch(setWarehouse({ warehouseId: Number(event.target.value) }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading warehouses</div>;
  }

  // рабочий вариант с select
  // return (
  //   <section className={cnStyles()}>
  //     <nav className={cnStyles('warehouses')}>
  //       <NavLink to="/"></NavLink>
  //     </nav>
  //     <select className={cnStyles('warehouses-select')} onChange={handleChange}>
  //       {warehouses && warehouses.map((warehouse) => (
  //         <option
  //           key={warehouse.id}
  //           className={cnStyles('item')}
  //           value={warehouse.id}
  //         >
  //           {warehouse.name}
  //         </option>
  //       ))}
  //     </select>
  //   </section>
  // );
  return (
    <section className={cnStyles()}>
      <nav className={cnStyles('warehouses')}>
        <NavLink to="/"></NavLink>
      </nav>
      <Listbox onChange={(value) => dispatch(setWarehouse({ warehouseId: Number(value) }))}>
        <Listbox.Button className={cnStyles('warehouses-select')}>
          {warehouses && warehouses[0]?.name}
        </Listbox.Button>
        <Listbox.Options>
          {warehouses && warehouses.map((warehouse) => (
            <Listbox.Option
              key={warehouse.id}
              value={warehouse.id}
              className={cnStyles('item')}
            >
              {warehouse.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </section>
  );
  // return (
  //   <section className={cnStyles()}>
  //     <nav className={cnStyles('warehouses')}>
  //       <NavLink to="/"></NavLink>
  //     </nav>
  //     <select className={cnStyles('warehouses-select')} onChange={handleChange}>
  //       <option className={cnStyles('item')} value={202}>
  //         Электроугли
  //       </option>
  //       <option className={cnStyles('item')} value={152}>
  //         Лобня
  //       </option>
  //       <option className={cnStyles('item')} value={153}>
  //         Брянск
  //       </option>
  //     </select>
  //   </section>
  // );
};

export default WarehouseSelector;
