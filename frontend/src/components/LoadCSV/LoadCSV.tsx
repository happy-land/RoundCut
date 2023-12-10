import block from 'bem-cn';
import { Link } from 'react-router-dom';
import './LoadCSV.scss';

const cnStyles = block('load-csv');

type priceItem = {
  name: string;
}

export const LoadCSV = () => {

  const handleClick = () => {
    console.log('clicked!');
    
  }

  return (
    <div className={cnStyles()}>
      {/* <Link to="#">Загрузить CSV файл</Link> */}
      <button onClick={handleClick}>Загрузить CSV файл</button>
    </div>
  );
};
