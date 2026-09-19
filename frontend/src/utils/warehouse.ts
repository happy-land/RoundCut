import { TWarehouse } from './types';

export const getWarehouseId = (
  warehouses: TWarehouse[],
  warehouseName: string,
): number => {
  const wh = warehouses.find(
    (warehouse) => warehouse.name === warehouseName,
  ) as TWarehouse;
  if (!wh) {
    return -1;
  }
  return wh.id;
};
