import { FC } from 'react'

interface IItemProps {
  name: string;
  checked: boolean;
  onClick: () => void;
}

const Item: FC<IItemProps> = () => {
  return (
    
    <div>Item</div>
  )
}


export default Item