import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { useFetchWarehousesQuery } from '../../services/warehouseApi';
import { setWarehouse } from '../../features/warehouse/warehouseSlice';
import { TWarehouse } from '../../utils/types';
import block from 'bem-cn';
import { useNavigate } from 'react-router-dom';

const cnStyles = block('warehouse-selector');

const WarehouseSelectorV2 = () => {
  const dispatch = useAppDispatch();
  const { data: warehouses, error, isLoading } = useFetchWarehousesQuery(0);
  const [selectedWarehouse, setSelectedWarehouse] = useState<TWarehouse | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (warehouses) {
      setSelectedWarehouse(warehouses[51]);
    }
  }, [warehouses]);

  const handleChange = (warehouse: TWarehouse) => {
    if (warehouse) {
      console.log(warehouse);
      setSelectedWarehouse(warehouse);
      // по умолчанию выбран склад Электроугли и в БД его id=202
      // в warehouseSlice defaultValue=202
      dispatch(setWarehouse({ warehouseId: Number(warehouse.id) }));
    }
  };

  const openModal = () => {
    // navigate('/modal', { state: { backgroundLocation: location } });
    navigate('/modal', {
      state: {
        backgroundLocation: {
          pathname: location.pathname,
          search: location.search,
        },
      },
    });
  };

  return (
    <div>
      <button onClick={openModal}> Open Modal</button>
      {selectedWarehouse?.name}
    </div>
  );
};

export default WarehouseSelectorV2;
