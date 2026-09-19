import { PriceList } from '../components/PriceList/PriceList';
import block from 'bem-cn';
import './Dashboard.scss';
import SearchFilter from '../components/SearchFilter/SearchFilter';
import SteelGrades from '../components/SteelGrades/SteelGrades';
import DiameterSelector from '../components/DiameterSelector/DiameterSelector';

const cnStyles = block('dashboard-container');

const Dashboard = () => {

  return (
    <div className={cnStyles()}>
      <section className={cnStyles('search-filter')}>
        <SearchFilter placeholder="Введите запрос, например: Круг" />
      </section>

      <section className={cnStyles('steelgrades-wrapper')}>
        <SteelGrades />
      </section>

      <section className={cnStyles('diameters-wrapper')}>
        <DiameterSelector />
      </section>

      <section className={cnStyles('pricelist-wrapper')}>
        <PriceList type="user" />
      </section>

    </div>
  );
};

export default Dashboard;
