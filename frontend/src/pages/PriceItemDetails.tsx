import { FC } from 'react';
import { useParams } from 'react-router-dom';


export const PriceItemDetails: FC = () => {
  const { itemId } = useParams();



  return (
    <div>{itemId}</div>
  )
}