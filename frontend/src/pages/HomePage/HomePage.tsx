import block from 'bem-cn';
import { LoadCSV } from '../../components/LoadCSV/LoadCSV';
import './HomePage.scss';

const cnStyles = block('home-page');

export const HomePage = () => {
  return (
    <main className={cnStyles()}>
      <h1 className={cnStyles('page-title')}>
        Главная страница
      </h1>
      <section className={cnStyles('section')}>
        <LoadCSV />
      </section>
      <section className={cnStyles('section')}>
        Показать результаты загрузки CSV файла
      </section>
    </main>
  )
}