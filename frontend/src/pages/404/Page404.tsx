import block from 'bem-cn';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import './Page404.scss';

const cnStyles = block('not-found');

export const Page404: FC = () => {
  return (
    <div className={cnStyles('container')}>
      <h1 className={cnStyles('title')}>Страница не найдена</h1>
      <p className={cnStyles('text')}>404</p>
      <Link to='/' className={cnStyles('link')}>
        На главную
      </Link>
    </div>
  );
};
