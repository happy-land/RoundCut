import React from 'react';
import { useAppDispatch } from '../../app/hooks';
import { useFetchWarehousesQuery } from '../../services/warehouseApi';
import { setWarehouse } from '../../features/warehouse/warehouseSlice';
import './WarehouseSelectorModal.scss';

const WarehouseSelectorModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: warehouses, isLoading, error } = useFetchWarehousesQuery(0);

  const handleWarehouseClick = (warehouseId: number) => {
    dispatch(setWarehouse({ warehouseId }));
  };

  if (isLoading) {
    return <div className="warehouse-selector-modal__loading">Loading...</div>;
  }

  if (error) {
    return <div className="warehouse-selector-modal__error">Error loading warehouses</div>;
  }

  return (
    <div className="warehouse-selector-modal">
      {warehouses?.map((warehouse) => (
        <div
          key={warehouse.id}
          className="warehouse-selector-modal__item"
          onClick={() => handleWarehouseClick(warehouse.id)}
        >
          {warehouse.name}
        </div>
      ))}
    </div>
  );
};

export default WarehouseSelectorModal;