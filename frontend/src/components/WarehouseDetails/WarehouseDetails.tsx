import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TWarehouse } from '../../utils/types';
import { useFetchWarehouseByIdQuery } from '../../services/warehouseApi';

const WarehouseDetails = () => {
  const params = useParams<{ id: string }>();
  // const [wh, setWh] = useState<TWarehouse>();

  const { data: warehouse } = useFetchWarehouseByIdQuery(Number(params.id));

  return (
    <>
      {warehouse && (
        <>
          {warehouse.id} ==  
          {warehouse.name} ==
          {warehouse.description}
        </>
      )}
    </>
  );
};

export default WarehouseDetails;
