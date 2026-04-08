import { FC } from 'react';
import block from 'bem-cn';
import './Cart.scss';
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from '../../services/cartApi';
import { TCartItem } from '../../utils/types';

const cnStyles = block('cart');

const Cart: FC = () => {
  const { data: items = [], isLoading } = useGetCartQuery();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();

  if (isLoading) {
    return <div className={cnStyles()}>Загрузка корзины...</div>;
  }

  if (items.length === 0) {
    return <div className={cnStyles()}>Корзина пуста</div>;
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.totalGoodsPrice + item.totalCuttingCost,
    0,
  );

  return (
    <div className={cnStyles()}>
      <div className={cnStyles('header')}>
        <h2 className={cnStyles('title')}>Корзина</h2>
        <button
          className={cnStyles('clear-btn')}
          onClick={() => clearCart()}
        >
          Очистить корзину
        </button>
      </div>

      <ul className={cnStyles('list')}>
        {items.map((item: TCartItem) => (
          <li key={item.id} className={cnStyles('item')}>
            <div className={cnStyles('item-info')}>
              <span className={cnStyles('item-name')}>
                {item.name} {item.size}
              </span>
              {item.warehouseName && (
                <span className={cnStyles('item-warehouse')}>
                  📦 {item.warehouseName}
                </span>
              )}
              <span className={cnStyles('item-qty')}>
                {item.quantity} шт · {item.weightTons} т
              </span>
              {item.cuttingDescription && (
                <span className={cnStyles('item-cutting')}>
                  Резка: {item.cuttingDescription}
                </span>
              )}
            </div>
            <div className={cnStyles('item-price')}>
              <span>
                {(item.totalGoodsPrice + item.totalCuttingCost).toFixed(0)} ₽
              </span>
              <button
                className={cnStyles('remove-btn')}
                onClick={() => removeItem(item.id)}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className={cnStyles('footer')}>
        <span className={cnStyles('total')}>
          Итого: {totalPrice.toFixed(0)} ₽
        </span>
      </div>
    </div>
  );
};

export default Cart;
