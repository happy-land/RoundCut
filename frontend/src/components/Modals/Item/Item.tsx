!import React, { FC } from 'react'

interface IItemProps {
  name: string;
  checked: boolean;
  onClick: () => void;
}

const Item: FC<IItemProps> = ({ name, onClick }) => {
  return (
    
    <div>Item</div>
  )
}


export default Item