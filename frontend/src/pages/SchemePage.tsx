import { FC } from "react";
import { useParams } from "react-router-dom";
import block from "bem-cn";
import {
  useGetSchemeQuery,
  useUpdateSchemeStatusMutation,
} from "../services/schemesApi";
import { useAppSelector } from "../app/hooks";
import { TSchemeItem, TSchemeStatus } from "../utils/types";
import CuttingBarDiagram from "../components/CuttingBarDiagram/CuttingBarDiagram";
import "./SchemePage.scss";

const cnStyles = block("scheme-page");

const STATUS_LABELS: Record<TSchemeStatus, string> = {
  draft: "Черновик",
  accepted: "Принято",
  completed: "Выполнено",
};

const formatSchemeDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

const SchemeItemBlock: FC<{ item: TSchemeItem }> = ({ item }) => {
  const piecesText = item.pieces
    .map((p) => `${p.lengthMm}×${p.qty}шт`)
    .join(", ");

  return (
    <section className={cnStyles("item")}>
      <p className={cnStyles("item__name")}>
        {item.productName}
        {item.gost ? `. ${item.gost}` : ""} тн ={" "}
        {Number(item.weightTons).toFixed(3)}
      </p>
      <p className={cnStyles("item__meta")}>
        всего шт = {item.totalQty} режем штук = {item.cutQty}
        {item.machine ? ` Чем режем ${item.machine}` : ""}
      </p>
      <p className={cnStyles("item__pieces")}>Заготовки: {piecesText}</p>

      {item.bars.map((bar) => (
        <div key={bar.index} className={cnStyles("bar")}>
          <p className={cnStyles("bar__label")}>
            Круг №{bar.index} — {bar.piecesMm.length} шт
          </p>
          <CuttingBarDiagram
            barLengthMm={item.barLengthMm}
            piecesMm={bar.piecesMm}
            kerfMm={Number(item.kerfMm)}
            endCutMm={Number(item.endCutMm)}
            remainderMm={bar.remainderMm}
          />
        </div>
      ))}
    </section>
  );
};

const SchemePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const schemeId = Number(id);
  const { data: scheme, isLoading, isError } = useGetSchemeQuery(schemeId);
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateSchemeStatusMutation();
  const user = useAppSelector((state) => state.auth.user);
  const canManage = user?.role === "admin" || user?.role === "manager";

  if (isLoading) {
    return <div className={cnStyles()}>Загрузка схемы...</div>;
  }
  if (isError || !scheme) {
    return <div className={cnStyles()}>Не удалось загрузить схему</div>;
  }

  const sortedItems = [...scheme.items].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <div className={cnStyles()}>
      <div className={cnStyles("sheet")}>
        {/* Шапка документа */}
        <div className={cnStyles("doc-header")}>
          <span>Схема Резки {scheme.number}</span>
          <span>Лист № 1</span>
          <span>Всего листов 1</span>
        </div>

        <h1 className={cnStyles("doc-title")}>Заявка на резку металла</h1>

        <div className={cnStyles("doc-meta")}>
          {scheme.warehouseName && (
            <p>
              Склад {scheme.warehouseName}
              {scheme.managerName ? ` — ${scheme.managerName}` : ""}
            </p>
          )}
          <p>
            Счет {scheme.number} от {formatSchemeDate(scheme.createdAt)}
          </p>
          {scheme.clientName && <p>Клиент: {scheme.clientName}</p>}
        </div>

        {/* Статусы */}
        <div className={cnStyles("status-row")}>
          {(Object.keys(STATUS_LABELS) as TSchemeStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              disabled={!canManage || isUpdating || scheme.status === s}
              className={cnStyles("status-btn", {
                active: scheme.status === s,
              })}
              onClick={() => updateStatus({ id: scheme.id, status: s })}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <p className={cnStyles("disclaimer")}>
          Порезанный металлопрокат возврату не подлежит. С выполнением работ в
          моё отсутствие согласен. Претензий к качеству резки и полученным
          размерам не имею.
        </p>

        {/* Позиции */}
        {sortedItems.map((item) => (
          <SchemeItemBlock key={item.id} item={item} />
        ))}

        <div className={cnStyles("actions")}>
          <button
            type="button"
            className={cnStyles("print-btn")}
            onClick={() => window.print()}
          >
            🖨 Печать
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemePage;
