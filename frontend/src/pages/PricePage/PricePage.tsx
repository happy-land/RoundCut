import { FC } from 'react';
import block from 'bem-cn'
import './PricePage.scss';
import { PriceList } from '../../components/PriceList/PriceList';

const cnStyles = block('price-page');

export const PricePage: FC = () => {
  return (
    <main className={cnStyles()}>
      <h1 className={cnStyles('page-title')}>
        Прайс
      </h1>
      <PriceList />
      {/* <section className={cnStyles('section')}>
        Таблица с прайсом - выгрузить из БД
      </section> */}
    </main>
  )
}