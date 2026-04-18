import { useParams } from 'react-router-dom';
import { useFetchWarehouseByIdQuery } from '../../services/warehouseApi';

const WarehouseDetails = () => {
  const params = useParams<{ id: string }>();
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
