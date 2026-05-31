import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import block from "bem-cn";
import "./CartPage.scss";
import ArrowLeftIcon from "../images/react-icons/hi/HiOutlineArrowLeft.svg";
import HiOutlineTrashIcon from "../images/react-icons/hi/HiOutlineTrash.svg";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useSendToSelfMutation,
  useSendGuestOrderMutation,
} from "../services/cartApi";
import { TCartItem } from "../utils/types";
import { CUT_CODE_LABELS } from "../utils/constants";
import { useCreateOrderFromCartMutation } from "../services/ordersApi";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  removeGuestCartItem,
  clearGuestCart,
  TGuestCartItem,
} from "../features/guestCart/guestCartSlice";
import { getCookie } from "../utils/cookie";

const cnStyles = block("cart-page");

/** Заменяет английские коды резки на русские названия в строке описания */
const localizeDescription = (desc: string): string =>
  Object.entries(CUT_CODE_LABELS).reduce(
    (str, [code, label]) => str.replace(new RegExp(code, "gi"), label),
    desc,
  );

const isGuest = () => !getCookie("accessToken");

type TPendingRemoval = {
  id: number;
  title: string;
  expiresAt: number;
};

type TConfirmMode = "none" | "post-send" | "clear-cart";

const UNDO_TIMEOUT_MS = 4000;

const CartPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const guest = isGuest();

  // Auth cart
  const { data: authItems = [], isLoading } = useGetCartQuery(undefined, {
    skip: guest,
  });
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const [sendToSelf, { isLoading: isSending }] = useSendToSelfMutation();

  // Guest cart
  const guestItems = useAppSelector((s) => s.guestCart.items);
  const [sendGuestOrder, { isLoading: isSendingGuest }] =
    useSendGuestOrderMutation();
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmailError, setGuestEmailError] = useState("");
  const [guestSent, setGuestSent] = useState(false);

  // Unified
  const items: (TCartItem | TGuestCartItem)[] = guest ? guestItems : authItems;
  const [createOrder, { isLoading: isSaving }] =
    useCreateOrderFromCartMutation();

  const [confirmMode, setConfirmMode] = useState<TConfirmMode>("none");
  const [pendingRemovals, setPendingRemovals] = useState<TPendingRemoval[]>([]);
  const [nowTs, setNowTs] = useState(Date.now());
  const pendingTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const clearPendingRemovals = () => {
    pendingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    pendingTimersRef.current.clear();
    setPendingRemovals([]);
  };

  const commitRemoval = async (id: number) => {
    const timerId = pendingTimersRef.current.get(id);
    if (timerId) {
      clearTimeout(timerId);
      pendingTimersRef.current.delete(id);
    }

    try {
      if (guest) {
        dispatch(removeGuestCartItem(id));
      } else {
        await removeItem(id).unwrap();
      }
    } catch {
      // If server removal fails, keep item in cart by just clearing pending state.
    } finally {
      setPendingRemovals((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const scheduleRemoval = (item: TCartItem | TGuestCartItem) => {
    if (pendingTimersRef.current.has(item.id)) return;

    const expiresAt = Date.now() + UNDO_TIMEOUT_MS;
    const title = `${item.name} ${item.size}`.trim();
    const timerId = setTimeout(() => {
      void commitRemoval(item.id);
    }, UNDO_TIMEOUT_MS);

    pendingTimersRef.current.set(item.id, timerId);
    setPendingRemovals((prev) => [...prev, { id: item.id, title, expiresAt }]);
  };

  const handleUndoRemoval = (id: number) => {
    const timerId = pendingTimersRef.current.get(id);
    if (timerId) {
      clearTimeout(timerId);
      pendingTimersRef.current.delete(id);
    }
    setPendingRemovals((prev) => prev.filter((entry) => entry.id !== id));
  };

  useEffect(() => {
    if (pendingRemovals.length === 0) return;

    const tickId = setInterval(() => setNowTs(Date.now()), 250);
    return () => clearInterval(tickId);
  }, [pendingRemovals.length]);

  useEffect(() => {
    return () => {
      pendingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      pendingTimersRef.current.clear();
    };
  }, []);

  const handleSendToSelf = async () => {
    await sendToSelf();
    setConfirmMode("post-send");
  };

  const handleSaveOrder = async () => {
    await createOrder();
    navigate("/orders");
  };

  const clearCartByRole = async () => {
    clearPendingRemovals();
    if (guest) {
      dispatch(clearGuestCart());
      return;
    }
    await clearCart();
  };

  const handleConfirmYes = async () => {
    if (confirmMode === "post-send" || confirmMode === "clear-cart") {
      await clearCartByRole();
    }
    setConfirmMode("none");
  };

  const handleConfirmNo = () => {
    setConfirmMode("none");
  };

  const openClearCartConfirm = () => {
    setConfirmMode("clear-cart");
  };

  const handleGuestSend = async () => {
    if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      setGuestEmailError("Введите корректный email");
      return;
    }
    setGuestEmailError("");
    await sendGuestOrder({
      email: guestEmail.trim(),
      name: guestName.trim() || "Гость",
      items: guestItems,
    });
    setGuestSent(true);
  };

  const pendingIds = new Set(pendingRemovals.map((entry) => entry.id));
  const visibleItems = items.filter((item) => !pendingIds.has(item.id));
  const latestPending = pendingRemovals[pendingRemovals.length - 1] ?? null;
  const undoRemainingMs = latestPending
    ? Math.max(0, latestPending.expiresAt - nowTs)
    : 0;
  const undoSecondsLeft = latestPending
    ? Math.max(1, Math.ceil(undoRemainingMs / 1000))
    : 0;
  const undoProgressPct = latestPending
    ? Math.min(
        100,
        Math.max(0, ((UNDO_TIMEOUT_MS - undoRemainingMs) / UNDO_TIMEOUT_MS) * 100),
      )
    : 0;
  const undoProgressStyle: CSSProperties = {
    width: `${undoProgressPct}%`,
  };

  const totalGoods = visibleItems.reduce(
    (s, i) => s + Number(i.totalGoodsPrice),
    0,
  );
  const totalCutting = visibleItems.reduce(
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
        {visibleItems.length > 0 && (
          <button
            className={cnStyles("danger-btn")}
            onClick={openClearCartConfirm}
            disabled={!guest && isClearing}
          >
            Очистить корзину
          </button>
        )}
      </div>

      {!guest && isLoading && <p className={cnStyles("empty")}>Загрузка...</p>}

      {visibleItems.length === 0 && (
        <p className={cnStyles("empty")}>Корзина пуста</p>
      )}

      {!isLoading && visibleItems.length > 0 && (
        <>
          <ul className={cnStyles("list")}>
            {(visibleItems as Array<TCartItem | TGuestCartItem>).map((item) => (
              <li key={item.id} className={cnStyles("list-item")}>
                <div className={cnStyles("list-item__view")}>
                  <span className={cnStyles("list-item__name")}>
                    {item.name} {item.size}
                    {item.surface ? ` ${item.surface}` : ""}
                    {item.other ? ` ${item.other}` : ""}
                  </span>

                  <div className={cnStyles("list-item__meta")}>
                    {item.billetData ? (
                      <>
                        <span className={cnStyles("list-item__meta-item")}>
                          {item.billetData.numCompleteCircles > 0 && (
                            <>{item.billetData.numCompleteCircles} цел.</>
                          )}
                          {item.billetData.partWeight > 0 && (
                            <>
                              {" "}
                              + 1 часть ({item.billetData.partWeight.toFixed(
                                3,
                              )}{" "}
                              т)
                            </>
                          )}{" "}
                          кругов
                        </span>

                        <span className={cnStyles("list-item__meta-item")}>
                          {Number(item.weightTons).toFixed(3)} т
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={cnStyles("list-item__meta-item")}>
                          {item.quantity} шт
                        </span>

                        <span className={cnStyles("list-item__meta-item")}>
                          {Number(item.weightTons).toFixed(3)} т
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className={cnStyles("list-item__right")}>
                  <div className={cnStyles("list-item__prices")}>
                    <div className={cnStyles("list-item__main-row")}>
                      <span className={cnStyles("list-item__price-main")}>
                        {Number(
                          Number(item.totalGoodsPrice) +
                            Number(item.totalCuttingCost),
                        ).toFixed(0)}{" "}
                        ₽
                      </span>
                    </div>

                    {item.billetData ? (
                      /* Цены по составляющим */
                      <>
                        {item.billetData.wholeCirclesWeight > 0 && (
                          <span className={cnStyles("list-item__price-sub")}>
                            цел.:{" "}
                            {item.billetData.wholeCirclesPricePerTon.toFixed(0)}{" "}
                            ₽/т
                          </span>
                        )}
                        {item.billetData.partWeight > 0 && (
                          <span className={cnStyles("list-item__price-sub")}>
                            часть: {item.billetData.partPricePerTon.toFixed(0)}{" "}
                            ₽/т
                          </span>
                        )}
                        {Number(item.totalCuttingCost) > 0 && (
                          <span className={cnStyles("list-item__price-sub")}>
                            металл {Number(item.totalGoodsPrice).toFixed(0)} +
                            резка {Number(item.totalCuttingCost).toFixed(0)}
                          </span>
                        )}
                      </>
                    ) : (
                      /* Обычная позиция — одна цена за тонну */
                      <>
                        <span className={cnStyles("list-item__price-sub")}>
                          {Number(item.pricePerTon).toFixed(0)} ₽/т
                        </span>
                        {Number(item.totalCuttingCost) > 0 && (
                          <span className={cnStyles("list-item__price-sub")}>
                            металл {Number(item.totalGoodsPrice).toFixed(0)} +
                            резка {Number(item.totalCuttingCost).toFixed(0)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {(item.billetData || item.cuttingDescription) && (
                  <div className={cnStyles("list-item__cutting")}>
                    <div className={cnStyles("list-item__cutting-head")}>
                      <span className={cnStyles("list-item__cutting-title")}>
                        Резка
                      </span>
                      {item.billetData && (
                        <details className={cnStyles("list-item__cut-info")}>
                          <summary
                            className={cnStyles("list-item__cut-info-toggle")}
                            aria-label="Параметры реза"
                          >
                            i
                          </summary>
                          <div
                            className={cnStyles("list-item__cut-info-popup")}
                          >
                            <div className={cnStyles("list-item__cut-info-note")}>
                              Срок резки: 2-4 дня
                            </div>
                            Толщина реза: {item.billetData.cutThickness} мм
                            {item.billetData.endCut > 0 &&
                              ` · Торцевой рез: ${item.billetData.endCut} мм`}
                          </div>
                        </details>
                      )}
                    </div>

                    {item.billetData ? (
                      <>
                        <span className={cnStyles("list-item__cutting-row")}>
                          🔧{" "}
                          {item.billetData.workpieces
                            .map((w) => `${w.length} мм × ${w.quantity} шт`)
                            .join(", ")}
                        </span>
                        <span className={cnStyles("list-item__cutting-row")}>
                          {item.billetData.totalCuts} резов
                        </span>
                      </>
                    ) : (
                      <span className={cnStyles("list-item__cutting-row")}>
                        {localizeDescription(item.cuttingDescription || "")}
                      </span>
                    )}
                  </div>
                )}

                <div className={cnStyles("list-item__footer")}>
                  {item.warehouseName && (
                    <span className={cnStyles("list-item__warehouse-chip")}>
                      <span className={cnStyles("list-item__warehouse-icon")}>
                        📦
                      </span>
                      <span className={cnStyles("list-item__warehouse-text")}>
                        {item.warehouseName}
                      </span>
                    </span>
                  )}

                  <button
                    type="button"
                    className={`${cnStyles("list-item__btn")} ${cnStyles("list-item__btn_delete")}`}
                    onClick={() => scheduleRemoval(item)}
                    title="Удалить"
                    aria-label="Удалить"
                  >
                    <img src={HiOutlineTrashIcon} alt="" aria-hidden="true" />
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
            {guest ? (
              /* === Гостевая форма === */
              guestSent ? (
                <div className={cnStyles("order-form__sent")}>
                  <span className={cnStyles("order-form__sent-icon")}>✅</span>
                  <p className={cnStyles("order-form__sent-text")}>
                    Заказ отправлен на <strong>{guestEmail}</strong>
                  </p>
                </div>
              ) : (
                <>
                  <h2 className={cnStyles("order-form__title")}>
                    Отправить заказ на почту
                  </h2>
                  <div className={cnStyles("order-form__guest")}>
                    <input
                      className={cnStyles("order-form__input")}
                      type="text"
                      placeholder="Ваше имя (необязательно)"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                    <input
                      className={cnStyles(
                        "order-form__input",
                        guestEmailError ? "error" : "",
                      )}
                      type="email"
                      placeholder="Ваш email *"
                      value={guestEmail}
                      onChange={(e) => {
                        setGuestEmail(e.target.value);
                        setGuestEmailError("");
                      }}
                    />
                    {guestEmailError && (
                      <span className={cnStyles("order-form__error")}>
                        {guestEmailError}
                      </span>
                    )}
                    <button
                      className={cnStyles("order-form__btn", "email")}
                      onClick={handleGuestSend}
                      disabled={isSendingGuest}
                    >
                      <span className={cnStyles("order-form__btn-icon")}>
                        ✉
                      </span>
                      <span className={cnStyles("order-form__btn-text")}>
                        <span className={cnStyles("order-form__btn-label")}>
                          {isSendingGuest
                            ? "Отправляем..."
                            : "Отправить заказ на почту"}
                        </span>
                        <span className={cnStyles("order-form__btn-hint")}>
                          Получите список товаров на email
                        </span>
                      </span>
                    </button>
                  </div>
                </>
              )
            ) : (
              /* === Авторизованная форма === */
              <>
                <h2 className={cnStyles("order-form__title")}>
                  Отправить заказ
                </h2>
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
                      <span className={cnStyles("order-form__btn-label")}>
                        {isSending ? "Отправляем..." : "Себе на почту"}
                      </span>
                      <span className={cnStyles("order-form__btn-hint")}>
                        Получите список товаров на email
                      </span>
                    </span>
                  </button>
                  <button
                    className={cnStyles("order-form__btn", "save")}
                    onClick={handleSaveOrder}
                    disabled={isSaving}
                  >
                    <span className={cnStyles("order-form__btn-icon")}>💾</span>
                    <span className={cnStyles("order-form__btn-text")}>
                      <span className={cnStyles("order-form__btn-label")}>
                        {isSaving ? "Сохраняем..." : "Сохранить заказ"}
                      </span>
                      <span className={cnStyles("order-form__btn-hint")}>
                        Записать в историю заказов
                      </span>
                    </span>
                  </button>
                  <button
                    className={cnStyles("order-form__btn", "manager")}
                    disabled
                  >
                    <span className={cnStyles("order-form__btn-icon")}>📋</span>
                    <span className={cnStyles("order-form__btn-text")}>
                      <span className={cnStyles("order-form__btn-label")}>
                        Запросить счёт
                      </span>
                      <span className={cnStyles("order-form__btn-hint")}>
                        Скоро будет доступно
                      </span>
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {confirmMode !== "none" && (
        <div className={cnStyles("confirm-overlay")}>
          <div className={cnStyles("confirm-dialog")}>
            <div className={cnStyles("confirm-dialog__icon")}>✅</div>
            <h3 className={cnStyles("confirm-dialog__title")}>
              {confirmMode === "clear-cart"
                ? "Очистить корзину?"
                : "Заказ отправлен на почту"}
            </h3>
            <p className={cnStyles("confirm-dialog__text")}>
              {confirmMode === "clear-cart"
                ? "Все товары будут удалены из корзины."
                : "Удалить товары из корзины?"}
            </p>
            <div className={cnStyles("confirm-dialog__actions")}>
              <button
                className={cnStyles("confirm-dialog__btn", "danger")}
                onClick={handleConfirmYes}
                disabled={!guest && isClearing}
              >
                Да
              </button>
              <button
                className={cnStyles("confirm-dialog__btn", "secondary")}
                onClick={handleConfirmNo}
                disabled={!guest && isClearing}
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}

      {latestPending && (
        <div className={cnStyles("undo-toast")} role="status" aria-live="polite">
          <span className={cnStyles("undo-toast__text")}>
            Удалено: {latestPending.title}
          </span>
          <button
            type="button"
            className={cnStyles("undo-toast__btn")}
            onClick={() => handleUndoRemoval(latestPending.id)}
          >
            Вернуть
          </button>
          <span className={cnStyles("undo-toast__timer")}>{undoSecondsLeft}с</span>
          <div className={cnStyles("undo-toast__progress")}
            aria-hidden="true"
          >
            <span
              className={cnStyles("undo-toast__progress-fill")}
              style={undoProgressStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
