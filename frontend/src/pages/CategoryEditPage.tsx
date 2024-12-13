import React, { FC } from 'react';
import AdminCategoryList from '../components/AdminCategoryList/AdminCategoryList';

interface ICategoryEditPageProps {

}

const CategoryEditPage: FC<ICategoryEditPageProps> = () => {
  return (
    <>
    <div>CategoryEditPage</div>
    <AdminCategoryList />
    </>
  )
}

export default CategoryEditPage