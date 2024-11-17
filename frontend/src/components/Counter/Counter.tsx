import { FC } from 'react';
import block from 'bem-cn';
// import { useDispatch, useSelector } from '../../hooks';
import {
  decrement,
  increment,
  incrementAsync,
  selectCount,
  updateByAmount,
} from './counterSlice';

import './Counter.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

interface ICounterProps {}

const cnStyles = block('counter');

const Counter: FC<ICounterProps> = () => {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  // const count = useSelector(selectCount);
  // const dispatch = useDispatch();

  return (
    <div className={cnStyles()}>
      <div className={cnStyles('row')}>
        <button
          className={cnStyles('button decrement-btn')}
          onClick={() => dispatch(decrement())}
        >
          -1
        </button>
        <p className={cnStyles('count')}>{count}</p>

        <button
          className={cnStyles('button increment-btn')}
          onClick={() => dispatch(increment())}
        >
          +1
        </button>
      </div>
      <div className={cnStyles('row')}>
        <button
          className={cnStyles('button')}
          onClick={() => dispatch(incrementAsync(5))}
        >
          - Async
        </button>
        <button
          className={cnStyles('button')}
          onClick={() => dispatch(incrementAsync(5))}
        >
          + Async
        </button>

        <button
          className={cnStyles('button')}
          onClick={() => dispatch(updateByAmount(5))}
        >
          Update
        </button>

        {/* <button className={cnStyles('button')}>Выгрузить прайс</button> */}
      </div>
    </div>
  );
};

export default Counter;
