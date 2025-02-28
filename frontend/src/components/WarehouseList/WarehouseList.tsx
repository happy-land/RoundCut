import { ChangeEvent, FC, MouseEvent, useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import block from 'bem-cn';
import './WarehouseList.scss';
import {
  useAddWarehouseMutation,
  useDeleteWarehouseMutation,
  useFetchWarehousesQuery,
} from '../../services/warehouseApi';
import { TWarehouse } from '../../utils/types';
import WarehouseItem from './WarehouseItem';
import { openModal } from '../../features/warehouse/warehouseSlice';

interface IWarehouseListProps {
  type: 'user' | 'admin';
}

const cnStyles = block('warehouse');

const WarehouseList: FC<IWarehouseListProps> = ({ type }) => {
  const dispatch = useAppDispatch();

  const [valid, setValid] = useState(false);
  const formRef = useRef(null);

  const [warehouseName, setWarehouseName] = useState<string>('');

  // queries
  const { data: warehouses = [] } = useFetchWarehousesQuery(0);

  // mutations
  const [addWarehouse] = useAddWarehouseMutation();
  const [deleteWarehouse] = useDeleteWarehouseMutation();

  const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    // const isValid: boolean = formRef.current?.checkValidity();
    setWarehouseName(event.target.value.toUpperCase());
  };

  const handleAddWarehouse = (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(`добавить склад ${warehouseName}`);
    const res = addWarehouse({ name: warehouseName });
    console.log(res);
  };

  const onWarehouseClick = (warehouse: TWarehouse) => {
    console.log(warehouse);
    // dispatch(openModal());
  };

  const handleDeleteWarehouse = async (
    event: MouseEvent<HTMLButtonElement>,
    warehouse: TWarehouse
  ) => {
    event.preventDefault();
    console.log(warehouse);
    const res = await deleteWarehouse(warehouse.id);
    console.log(res); 
  };

  const content = (
    <ul className={cnStyles('items-list')}>
      {warehouses.map((warehouse: TWarehouse, index: number) => (
        <li className={cnStyles('list-item')} key={index}>
          <WarehouseItem
            item={warehouse}
            onClick={() => onWarehouseClick(warehouse)}
          />
          <button onClick={(event) => handleDeleteWarehouse(event, warehouse)}>
            X
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cnStyles()}>
      <h1>Металлобазы</h1>
      {type === 'admin' && (
        <form onSubmit={handleAddWarehouse}>
          <input
            type="text"
            name="name"
            value={warehouseName?.toUpperCase()}
            onChange={handleFormChange}
            placeholder="Название склада"
            required
          />
          <button type="submit">Добавить</button>
        </form>
      )}
      {content && (
        <section className={cnStyles('content-section')}>{content}</section>
      )}
      {warehouses.length === 0 && <p>Складов пока нет</p>}
    </div>
  );
};

export default WarehouseList;
