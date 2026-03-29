import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import block from 'bem-cn';
import { useAppDispatch } from '../../app/hooks';
import { setSearchQuery } from '../../features/search/searchSlice';
import './Footer.scss';

const cnStyles = block('footer');

const CATEGORIES = [
  'Арматура', 'Балка', 'Катанка', 'Квадрат', 'Круг', 'Лист',
  'Поковка', 'Полоса', 'Проволока', 'Сетка', 'Труба', 'Уголок',
  'Швеллер', 'Шестигранник',
];

const NAV_LINKS = [
  { label: 'Прайс', to: '/dashboard' },
  { label: 'Корзина', to: '/cart' },
  { label: 'Заказы', to: '/orders' },
  { label: 'Профиль', to: '/profile' },
];

const Footer: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleCategory = (cat: string) => {
    dispatch(setSearchQuery(cat));
    navigate('/dashboard');
  };

  const half = Math.ceil(CATEGORIES.length / 2);
  const col1 = CATEGORIES.slice(0, half);
  const col2 = CATEGORIES.slice(half);

  return (
    <footer className={cnStyles()}>
      <div className={cnStyles('inner')}>

        {/* Колонка 1: бренд */}
        <div className={cnStyles('col')}>
          <span className={cnStyles('logo')}>RoundCut</span>
          <p className={cnStyles('tagline')}>
            Металлопрокат с резкой.<br />
            Быстрый расчёт, удобный заказ.
          </p>
          <p className={cnStyles('copy')}>© 2026 RoundCut</p>
        </div>

        {/* Колонка 2: навигация */}
        <div className={cnStyles('col')}>
          <h4 className={cnStyles('heading')}>Навигация</h4>
          <ul className={cnStyles('nav-list')}>
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link className={cnStyles('link')} to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Колонка 3: каталог */}
        <div className={cnStyles('col')}>
          <h4 className={cnStyles('heading')}>Каталог товаров</h4>
          <div className={cnStyles('catalog')}>
            <ul className={cnStyles('nav-list')}>
              {col1.map((cat) => (
                <li key={cat}>
                  <button className={cnStyles('link')} onClick={() => handleCategory(cat)}>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
            <ul className={cnStyles('nav-list')}>
              {col2.map((cat) => (
                <li key={cat}>
                  <button className={cnStyles('link')} onClick={() => handleCategory(cat)}>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Колонка 4: контакты */}
        <div className={cnStyles('col')}>
          <h4 className={cnStyles('heading')}>Контакты</h4>
          <ul className={cnStyles('contacts')}>
            <li>
              <span className={cnStyles('contact-icon')}>📞</span>
              <a className={cnStyles('link')} href="tel:+74951234567">+7 (495) 123-45-67</a>
            </li>
            <li>
              <span className={cnStyles('contact-icon')}>✉️</span>
              <a className={cnStyles('link')} href="mailto:info@roundcut.ru">info@roundcut.ru</a>
            </li>
            <li>
              <span className={cnStyles('contact-icon')}>📍</span>
              <span className={cnStyles('contact-text')}>г. Москва, ул. Промышленная, 12</span>
            </li>
            <li>
              <span className={cnStyles('contact-icon')}>🕐</span>
              <span className={cnStyles('contact-text')}>Пн–Пт: 9:00 – 18:00</span>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
