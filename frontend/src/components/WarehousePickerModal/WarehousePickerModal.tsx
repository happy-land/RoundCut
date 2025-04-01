import React, { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { useFetchWarehousesQuery } from '../../services/warehouseApi';
import { setWarehouse } from '../../features/warehouse/warehouseSlice';
import './WarehousePickerModal.scss';
import { useNavigate } from 'react-router-dom';
import SearchFilter from '../SearchFilter/SearchFilter';

const WarehousePickerModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: warehouses, isLoading, error } = useFetchWarehousesQuery(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleWarehouseClick = (warehouseId: number) => {
    dispatch(setWarehouse({ warehouseId }));
    navigate(-1);
  };

  const handleCloseModal = () => {
    navigate(-1); // Close modal when the close icon is clicked
  };

  const filteredWarehouses = warehouses?.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return <div className="warehouse-selector-modal__loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="warehouse-selector-modal__error">
        Error loading warehouses
      </div>
    );
  }

  return (
    <div className="warehouse-picker-modal">
      {/* Close Modal Icon */}
      <button
        className="warehouse-picker-modal__close"
        onClick={handleCloseModal}
        aria-label="Close Modal"
      >
        ✖
      </button>

      {/* Sticky Header with Search */}
      <div className="warehouse-picker-modal__header">
        <div className="warehouse-picker-modal__search">
          <span className="icon">🔍</span>
          <input
            type="text"
            placeholder="Название склада..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <span
              className="icon icon--clear"
              onClick={() => setSearchQuery('')}
            >
              ✖
            </span>
          )}
        </div>
      </div>

      {/* Warehouse List */}
      <ul className="warehouse-picker-modal__list">
        {filteredWarehouses?.map((warehouse) => (
          <li
            key={warehouse.id}
            className="warehouse-picker-modal__item"
            onClick={() => handleWarehouseClick(warehouse.id)}
          >
            {warehouse.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WarehousePickerModal;
