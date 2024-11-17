import React from 'react';
import { PriceList } from '../PriceList/PriceList';

type Props = {};

const AdminPrice = (props: Props) => {
  return (
    <>
      <div>AdminPrice!!</div>
      <PriceList type='admin' />
    </>
  );
};

export default AdminPrice;
