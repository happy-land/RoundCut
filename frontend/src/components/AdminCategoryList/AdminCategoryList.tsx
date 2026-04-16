import React, { ChangeEvent, FC, MouseEvent, useState } from 'react';
import block from 'bem-cn';
import './AdminCategoryList.scss';
import { useAddCategoryMutation, useFetchCategoriesQuery } from '../../services/categoryApi';
import { TAdminCategory } from '../../utils/types';

interface IAdminCategoryListProps {}

const cnStyles = block('admin-category-list');

const AdminCategoryList: FC<IAdminCategoryListProps> = () => {
  const [categoryTitle, setCategoryTitle] = useState<string>('');

  // queries
  const { data: categories = [] } = useFetchCategoriesQuery(0);

  // mutations
  const [addCategory] = useAddCategoryMutation();

  const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setCategoryTitle(event.target.value);
  };

  const handleAddCategory = (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    const res = addCategory({ name: categoryTitle });
    console.log(res);
    setCategoryTitle('');
  };

  const content = (
    <ul className={cnStyles('items-list')}>
      {categories.map((category: TAdminCategory, index: number) => (
        <li className={cnStyles('list-item')} key={index}>
          {category.name}
          {/* <button onClick={(event) => handleDeleteWarehouse(event, warehouse)}>
            X
          </button> */}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cnStyles()}>
      <h1 className={cnStyles('title')}>Категории</h1>
      <form className={cnStyles('form')} onSubmit={handleAddCategory}>
        <input
          className={cnStyles('input')}
          type="text"
          name="name"
          value={categoryTitle}
          onChange={handleFormChange}
          placeholder="Название категории"
          required
        />
        <button type="submit">Добавить</button>
      </form>
      {content && (
        <section className={cnStyles('content-section')}>{content}</section>
      )}
      {categories.length === 0 && <p>Категорий пока нет</p>}
    </div>
  );
};

export default AdminCategoryList;
