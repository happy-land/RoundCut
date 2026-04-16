import { MouseEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeItem, selectCut } from '../../features/cut/cutSlice';
import block from 'bem-cn';
import './BilletPanel.scss';
import BilletCell from '../BilletCell/BilletCell';

const cnStyles = block('billet-panel');

type Props = {};

const BilletPanel = (props: Props) => {
  const { items } = useAppSelector(selectCut);
  const dispatch = useAppDispatch();

  const handleRemoveItem = (
    event: MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    event.preventDefault();
    console.log(id);
    dispatch(removeItem({ id }));
  };

  return (
    <section className={cnStyles()}>
      <h2>Заготовки</h2>
      <ul className={cnStyles('items-list')}>
        {items.map((item, index: number) => (
          <li className={cnStyles('list-item')} key={index}>
            <BilletCell item={item} />
            <button onClick={(event) => handleRemoveItem(event, item.id)}>
              X
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BilletPanel;
