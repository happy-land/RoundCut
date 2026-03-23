import { FC, useState } from "react";
import { NavLink } from "react-router-dom";
import block from "bem-cn";
import "./CartPage.scss";
import ArrowLeftIcon from "../images/react-icons/hi/HiOutlineArrowLeft.svg";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useSendToSelfMutation,
} from "../services/cartApi";
import { TCartItem } from "../utils/types";
import { CUT_CODE_LABELS } from "../utils/constants";

const cnStyles = block("cart-page");

/** Заменяет английские коды резки на русские названия в строке описания */
const localizeDescription = (desc: string): string =>
  Object.entries(CUT_CODE_LABELS).reduce(
    (str, [code, label]) => str.replace(new RegExp(code, "gi"), label),
    desc,
  );

const CartPage: FC = () => {
  const { data: items = [], isLoading } = useGetCartQuery();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const [sendToSelf, { isLoading: isSending }] = useSendToSelfMutation();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendToSelf = async () => {
    await sendToSelf();
    setShowConfirm(true);
  };

  const handleConfirmClear = async () => {
    await clearCart();
    setShowConfirm(false);
  };

  const handleConfirmKeep = () => {
    setShowConfirm(false);
  };

  const totalGoods = items.reduce((s, i) => s + Number(i.totalGoodsPrice), 0);
  const totalCutting = items.reduce(
    (s, i) => s + Number(i.totalCuttingCost),
    0,
  );
  const totalAll = totalGoods + totalCutting;

  return (
    <div className={cnStyles()}>
      <div className={cnStyles("header")}>
        <div className={cnStyles("header__left")}>
          <NavLink to="/dashboard" className={cnStyles("back-btn")}>
            <img src={ArrowLeftIcon} alt="Назад" />
          </NavLink>
          <h1 className={cnStyles("title")}>Корзина</h1>
        </div>
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
                      Резка: {localizeDescription(item.cuttingDescription)}
                    </span>
                  )}
                </div>

                <div className={cnStyles("list-item__right")}>
                  <div className={cnStyles("list-item__prices")}>
                    <span className={cnStyles("list-item__price-main")}>
                      {Number(Number(item.totalGoodsPrice) + Number(item.totalCuttingCost)).toFixed(0)} ₽
                    </span>
                    <span className={cnStyles("list-item__price-sub")}>
                      {Number(item.pricePerTon).toFixed(0)} ₽/т
                    </span>
                    {Number(item.totalCuttingCost) > 0 && (
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

          <div className={cnStyles("order-form")}>
            <h2 className={cnStyles("order-form__title")}>Отправить заказ</h2>
            <p className={cnStyles("order-form__subtitle")}>
              Выберите способ оформления заказа
            </p>
            <div className={cnStyles("order-form__actions")}>
              <button
                className={cnStyles("order-form__btn", "email")}
                onClick={handleSendToSelf}
                disabled={isSending}
              >
                <span className={cnStyles("order-form__btn-icon")}>✉</span>
                <span className={cnStyles("order-form__btn-text")}>
                  <span className={cnStyles("order-form__btn-label")}>{isSending ? "Отправляем..." : "Себе на почту"}</span>
                  <span className={cnStyles("order-form__btn-hint")}>Получите список товаров на email</span>
                </span>
              </button>
              <button className={cnStyles("order-form__btn", "manager")}>
                <span className={cnStyles("order-form__btn-icon")}>📋</span>
                <span className={cnStyles("order-form__btn-text")}>
                  <span className={cnStyles("order-form__btn-label")}>Запросить счёт</span>
                  <span className={cnStyles("order-form__btn-hint")}>Менеджер выставит счёт на оплату</span>
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {showConfirm && (
        <div className={cnStyles("confirm-overlay")}>
          <div className={cnStyles("confirm-dialog")}>
            <div className={cnStyles("confirm-dialog__icon")}>✅</div>
            <h3 className={cnStyles("confirm-dialog__title")}>
              Заказ отправлен на почту
            </h3>
            <p className={cnStyles("confirm-dialog__text")}>
              Удалить товары из корзины?
            </p>
            <div className={cnStyles("confirm-dialog__actions")}>
              <button
                className={cnStyles("confirm-dialog__btn", "danger")}
                onClick={handleConfirmClear}
              >
                Да, удалить
              </button>
              <button
                className={cnStyles("confirm-dialog__btn", "secondary")}
                onClick={handleConfirmKeep}
              >
                Нет, оставить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
