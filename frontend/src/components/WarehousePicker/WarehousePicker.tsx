import { useAppSelector } from '../../app/hooks';
import { useFetchWarehouseByIdQuery } from '../../services/warehouseApi';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
import block from 'bem-cn';
import { Link } from 'react-router-dom';

const cnStyles = block('warehouse-selector');

const WarehousePicker = () => {
  const warehouseId = useAppSelector(selectWarehouseId);
  const { data: warehouse } = useFetchWarehouseByIdQuery(warehouseId);

  return (
    <Link
      to={{
        pathname: '/select-warehouse',
      }}
      state={{ backgroundLocation: true }}
      className={cnStyles()}
    >
      {warehouse && <div>{warehouse.name}</div>}
    </Link>
  );
};

export default WarehousePicker;
