import { FC } from 'react'
import AdminCutList from '../components/AdminCutList/AdminCutList'

interface ICutProps {
  
}

export const Cut: FC<ICutProps> = () => {
  return (
    <>
    <div>Cut</div>
    <AdminCutList />
    </>
    
  )
}

export default Cut