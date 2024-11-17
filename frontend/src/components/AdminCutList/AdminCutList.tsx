import React, { ChangeEvent, FC, MouseEvent, useState } from 'react';
import block from 'bem-cn';
import './AdminCutList.scss';
import {
  useAddAdminCutMutation,
  useFetchAdminCutsQuery,
} from '../../services/adminCutApi';
import { TAdminCut } from '../../utils/types';

interface IAdminCutListProps {}

const cnStyles = block('admin-cut');

const AdminCutList: FC<IAdminCutListProps> = () => {
  const [cutTitle, setCutTitle] = useState<string>('');
  // queries
  const { data: cuts = [] } = useFetchAdminCutsQuery(0);

  // mutations
  const [addCut] = useAddAdminCutMutation();
  // const [deleteWarehouse] = useDeleteWarehouseMutation();

  const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setCutTitle(event.target.value);
  };

  const handleAddCut = (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    const res = addCut({ name: cutTitle });
    console.log(res);
    setCutTitle('');
  };

  const content = (
    <ul className={cnStyles('items-list')}>
      {cuts.map((cut: TAdminCut, index: number) => (
        <li className={cnStyles('list-item')} key={index}>
          {cut.name}
          {/* <button onClick={(event) => handleDeleteWarehouse(event, warehouse)}>
            X
          </button> */}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cnStyles()}>
      <h1 className={cnStyles('title')}>Резка</h1>
      <form className={cnStyles('form')} onSubmit={handleAddCut}>
        <input
          className={cnStyles('input')}
          type="text"
          name="name"
          value={cutTitle}
          onChange={handleFormChange}
          placeholder="Название резки"
          required
        />
        <button type="submit">Добавить</button>
      </form>
      {content && (
        <section className={cnStyles('content-section')}>{content}</section>
      )}
      {cuts.length === 0 && <p>Складов пока нет</p>}
    </div>
  );
};

export default AdminCutList;
