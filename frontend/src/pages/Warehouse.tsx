// !import React from 'react'

import WarehouseList from '../components/WarehouseList/WarehouseList'

type Props = {}

const Warehouse = (props: Props) => {
  return (
    <>
    <div>Warehouse</div>
    <WarehouseList type='admin' />
    </>
    
  )
}

export default Warehouse