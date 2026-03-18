import { FC } from "react";
import block from "bem-cn";
import "./CartPage.scss";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "../services/cartApi";
import { TCartItem } from "../utils/types";

const cnStyles = block("cart-page");

const CartPage: FC = () => {
  const { data: items = [], isLoading } = useGetCartQuery();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const totalGoods = items.reduce((s, i) => s + Number(i.totalGoodsPrice), 0);
  const totalCutting = items.reduce(
    (s, i) => s + Number(i.totalCuttingCost),
    0,
  );
  const totalAll = totalGoods + totalCutting;

  return (
    <div className={cnStyles()}>
      <div className={cnStyles("header")}>
        <h1 className={cnStyles("title")}>Корзина</h1>
        {items.length > 0 && (
          <button
            className={cnStyles("danger-btn")}
            onClick={() => clearCart()}
            disabled={isClearing}
          >
            Очистить корзину
          </button>
        )}
      </div>

      {isLoading && (
        <p className={cnStyles("empty")}>Загрузка...</p>
      )}

      {!isLoading && items.length === 0 && (
        <p className={cnStyles("empty")}>Корзина пуста</p>
      )}

      {!isLoading && items.length > 0 && (
        <>
          <ul className={cnStyles("list")}>
            {items.map((item: TCartItem) => (
              <li key={item.id} className={cnStyles("list-item")}>
                <div className={cnStyles("list-item__view")}>
                  <span className={cnStyles("list-item__name")}>
                    {item.name} {item.size}
                  </span>

                  <span className={cnStyles("list-item__badge", "qty")}>
                    {item.quantity} шт
                  </span>

                  <span className={cnStyles("list-item__badge", "weight")}>
                    {Number(item.weightTons).toFixed(3)} т
                  </span>

                  {item.cuttingDescription && (
                    <span className={cnStyles("list-item__badge", "cutting")}>
                      Резка: {item.cuttingDescription}
                    </span>
                  )}
                </div>

                <div className={cnStyles("list-item__right")}>
                  <div className={cnStyles("list-item__prices")}>
                    <span className={cnStyles("list-item__price-main")}>
                      {Number(item.totalGoodsPrice + item.totalCuttingCost).toFixed(0)} ₽
                    </span>
                    {item.totalCuttingCost > 0 && (
                      <span className={cnStyles("list-item__price-sub")}>
                        металл {Number(item.totalGoodsPrice).toFixed(0)} + резка{" "}
                        {Number(item.totalCuttingCost).toFixed(0)}
                      </span>
                    )}
                  </div>

                  <button
                    className={cnStyles("list-item__btn", "delete")}
                    onClick={() => removeItem(item.id)}
                    title="Удалить"
                  >
                    ✕ Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className={cnStyles("summary")}>
            <div className={cnStyles("summary__row")}>
              <span className={cnStyles("summary__label")}>Металл:</span>
              <span className={cnStyles("summary__value")}>
                {totalGoods.toFixed(0)} ₽
              </span>
            </div>
            {totalCutting > 0 && (
              <div className={cnStyles("summary__row")}>
                <span className={cnStyles("summary__label")}>Резка:</span>
                <span className={cnStyles("summary__value")}>
                  {totalCutting.toFixed(0)} ₽
                </span>
              </div>
            )}
            <div className={cnStyles("summary__row", "total")}>
              <span className={cnStyles("summary__label")}>Итого:</span>
              <span className={cnStyles("summary__value")}>
                {totalAll.toFixed(0)} ₽
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
