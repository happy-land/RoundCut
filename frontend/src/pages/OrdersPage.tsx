import { FC, useState } from "react";
import { NavLink } from "react-router-dom";
import block from "bem-cn";
import "./OrdersPage.scss";
import ArrowLeftIcon from "../images/react-icons/hi/HiOutlineArrowLeft.svg";
import { useGetOrdersQuery } from "../services/ordersApi";
import { TOrder, TOrderItem } from "../utils/types";
import { CUT_CODE_LABELS } from "../utils/constants";

const cnStyles = block("orders-page");

const localizeDescription = (desc: string): string =>
  Object.entries(CUT_CODE_LABELS).reduce(
    (str, [code, label]) => str.replace(new RegExp(code, "gi"), label),
    desc,
  );

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OrdersPage: FC = () => {
  const { data: orders = [], isLoading } = useGetOrdersQuery();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cnStyles()}>
      <div className={cnStyles("header")}>
        <NavLink to="/dashboard" className={cnStyles("back-btn")}>
          <img src={ArrowLeftIcon} alt="Назад" />
        </NavLink>
        <h1 className={cnStyles("title")}>Мои заказы</h1>
      </div>

      {isLoading && <p className={cnStyles("empty")}>Загрузка...</p>}

      {!isLoading && orders.length === 0 && (
        <p className={cnStyles("empty")}>Заказов пока нет</p>
      )}

      {!isLoading && orders.length > 0 && (
        <ul className={cnStyles("list")}>
          {orders.map((order: TOrder) => {
            const isExpanded = expandedIds.has(order.id);
            return (
              <li key={order.id} className={cnStyles("card")}>
                <div
                  className={cnStyles("card__header")}
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className={cnStyles("card__meta")}>
                    <span className={cnStyles("card__number")}>
                      Заказ #{order.id}
                    </span>
                    <span className={cnStyles("card__date")}>
                      {formatDate(order.createdAt)}
                    </span>
                    <span className={cnStyles("card__count")}>
                      {order.items.length} позиц.
                    </span>
                  </div>

                  <div className={cnStyles("card__totals")}>
                    <span className={cnStyles("card__total-goods")}>
                      Металл: {Number(order.totalGoods).toFixed(0)} ₽
                    </span>
                    {Number(order.totalCutting) > 0 && (
                      <span className={cnStyles("card__total-cutting")}>
                        Резка: {Number(order.totalCutting).toFixed(0)} ₽
                      </span>
                    )}
                    <span className={cnStyles("card__total-all")}>
                      Итого: {Number(order.totalAll).toFixed(0)} ₽
                    </span>
                  </div>

                  <span className={cnStyles("card__toggle")}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>

                {isExpanded && (
                  <ul className={cnStyles("items")}>
                    {order.items.map((item: TOrderItem) => (
                      <li key={item.id} className={cnStyles("item")}>
                        <div className={cnStyles("item__view")}>
                          <span className={cnStyles("item__name")}>
                            {item.name} {item.size}
                          </span>

                          {item.warehouseName && (
                            <span className={cnStyles("item__badge", "warehouse")}>
                              📦 {item.warehouseName}
                            </span>
                          )}

                          {item.billetData ? (
                            <>
                              <span className={cnStyles("item__badge", "qty")}>
                                {item.billetData.numCompleteCircles > 0 && (
                                  <>{item.billetData.numCompleteCircles} цел.</>
                                )}
                                {item.billetData.partWeight > 0 && (
                                  <>
                                    {" "}+ 1 часть (
                                    {item.billetData.partWeight.toFixed(3)} т)
                                  </>
                                )}
                                {" "}кругов
                              </span>

                              <span className={cnStyles("item__badge", "weight")}>
                                {Number(item.weightTons).toFixed(3)} т
                              </span>

                              <span className={cnStyles("item__badge", "billet-wp")}>
                                🔧&nbsp;
                                {item.billetData.workpieces
                                  .map((w) => `${w.length} мм × ${w.quantity} шт`)
                                  .join(", ")}
                              </span>

                              <span className={cnStyles("item__badge", "billet-params")}>
                                рез {item.billetData.cutThickness} мм
                                {item.billetData.endCut > 0 &&
                                  ` · торец ${item.billetData.endCut} мм`}
                                {" · "}{item.billetData.totalCuts} резов
                              </span>
                            </>
                          ) : (
                            <>
                              <span className={cnStyles("item__badge", "qty")}>
                                {item.quantity} шт
                              </span>

                              <span className={cnStyles("item__badge", "weight")}>
                                {Number(item.weightTons).toFixed(3)} т
                              </span>

                              {item.cuttingDescription && (
                                <span className={cnStyles("item__badge", "cutting")}>
                                  Резка:{" "}
                                  {localizeDescription(item.cuttingDescription)}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div className={cnStyles("item__right")}>
                          <span className={cnStyles("item__price-main")}>
                            {(
                              Number(item.totalGoodsPrice) +
                              Number(item.totalCuttingCost)
                            ).toFixed(0)}{" "}
                            ₽
                          </span>

                          {item.billetData ? (
                            <>
                              {item.billetData.wholeCirclesWeight > 0 && (
                                <span className={cnStyles("item__price-sub")}>
                                  цел.:{" "}
                                  {item.billetData.wholeCirclesPricePerTon.toFixed(
                                    0,
                                  )}{" "}
                                  ₽/т
                                </span>
                              )}
                              {item.billetData.partWeight > 0 && (
                                <span className={cnStyles("item__price-sub")}>
                                  часть:{" "}
                                  {item.billetData.partPricePerTon.toFixed(0)}{" "}
                                  ₽/т
                                </span>
                              )}
                            </>
                          ) : (
                            <span className={cnStyles("item__price-sub")}>
                              {Number(item.pricePerTon).toFixed(0)} ₽/т
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;
