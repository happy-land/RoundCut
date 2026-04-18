import { FC } from 'react';
import './BilletModal.scss';
import BilletCellNew from '../BilletCellNew/BilletCellNew';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';

interface BilletModalProps {

}

const BilletModal: FC<BilletModalProps> = () => {
  const { id } = useParams<{  id: string }>();
  const warehouseId = useAppSelector(selectWarehouseId);

  if (!id) {
    return null;
  }

  return (
    <BilletCellNew id={id} warehouseId={warehouseId} />
  )
    
};

export default BilletModal;