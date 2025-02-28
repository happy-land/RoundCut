import { ChangeEvent, useEffect, useState } from 'react';
// import block from 'bem-cn';
// import './WarehouseSelector.scss';
// import { NavLink } from 'react-router-dom';
import { setWarehouse } from '../../features/warehouse/warehouseSlice';
import { useAppDispatch } from '../../app/hooks';
import { useFetchWarehousesQuery } from '../../services/warehouseApi';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { TWarehouse } from '../../utils/types';
// import clsx from 'clsx';

// const cnStyles = block('warehouse-selector');

const WarehouseSelector = () => {
  const dispatch = useAppDispatch();
  const { data: warehouses, error, isLoading } = useFetchWarehousesQuery(0);
  const [query, setQuery] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<TWarehouse | null>(
    null,
  );

  // const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
  const handleChange = (warehouse: TWarehouse) => {
    if (warehouse) {
      console.log(warehouse);
      setSelectedWarehouse(warehouse);
      // по умолчанию выбран склад Электроугли и в БД его id=202
      // в warehouseSlice defaultValue=202
      dispatch(setWarehouse({ warehouseId: Number(warehouse.id) }));
    }
  };

  useEffect(() => {
    if (warehouses) {
      setSelectedWarehouse(warehouses[51]);
    }
  }, [warehouses]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading warehouses</div>;
  }
  if (warehouses) {
    // console.log(warehouses);
    // setSelectedWarehouse(warehouses[51]);
  }

  const filteredWarehouses =
    query === ''
      ? warehouses || []
      : (warehouses || []).filter((warehouse) => {
          return warehouse.name.toLowerCase().includes(query.toLowerCase());
        });

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
    <>
      <section className="w-80 py-2">
        <Combobox
          immediate
          value={selectedWarehouse}
          // onChange={(value) => setSelectedWarehouse(value)}
          onChange={(value) => handleChange(value!)}
          onClose={() => setQuery('')}
        >
          <div className="relative">
            <ComboboxInput
              className="w-full border border-black rounded-full pl-3"
              // className={cnStyles('warehouses-select')}
              // className={clsx(
              //   'w-full rounded-lg border-none bg-white/5 py-1.5 pr-8 pl-3 text-sm/6 text-white',
              //   'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
              // )}
              displayValue={(warehouse: TWarehouse) => warehouse?.name}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
              <ChevronDownIcon className="size-4 fill-black/60 group-data-[hover]:fill-black" />
            </ComboboxButton>
          </div>
          <ComboboxOptions
            anchor="bottom"
            transition
            className="border border-red-400 rounded-lg w-[var(--input-width)] bg-gray-300"
            // className={clsx(
            //   'w-[var(--input-width)] rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
            //   'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0',
            // )}
          >
            {filteredWarehouses &&
              filteredWarehouses.map((warehouse) => (
                <ComboboxOption
                  key={warehouse.id}
                  value={warehouse}
                  // className={cnStyles('item')}
                  className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-black/50"
                >
                  <CheckIcon className="h-5 w-5 invisible size-4 fill-black group-data-[selected]:visible" />
                  <div className="text-sm/6 text-black">{warehouse.name}</div>
                </ComboboxOption>
              ))}
          </ComboboxOptions>
        </Combobox>
      </section>
    </>
    // <section className={cnStyles()}>
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
