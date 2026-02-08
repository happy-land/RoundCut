import { FC, useState } from "react";
import block from "bem-cn";
import "./BilletCellNew.scss";
import { useFetchItemQuery } from "../../services/priceApi";
import { MDBInput } from "mdb-react-ui-kit";

const cnStyles = block("billet-cell-new-container");

interface IBilletCellNewProps {
  id: string;
}

interface Workpiece {
  id: string;
  length: number;
  quantity: number;
}

interface BilletResult {
  billetIndex: number;
  items: Array<{
    length: number;
    quantity: number;
    workpieces: number;
  }>;
  usedLength: number;
  billetLength: number;
  endCut: number;
  totalCuts: number;
}

const BilletCellNew: FC<IBilletCellNewProps> = ({ id }) => {
  const { data: itemExtended } = useFetchItemQuery(Number(id));
  const [cutThickness, setCutThickness] = useState<number>(2);
  const [endCut, setEndCut] = useState<number>(0);
  const [workpieces, setWorkpieces] = useState<Workpiece[]>([
    { id: "1", length: 0, quantity: 0 },
  ]);

  const addWorkpiece = () => {
    const newId = String(
      Math.max(...workpieces.map((w) => Number(w.id)), 0) + 1,
    );
    setWorkpieces([...workpieces, { id: newId, length: 0, quantity: 0 }]);
  };

  const removeWorkpiece = (id: string) => {
    if (workpieces.length > 1) {
      setWorkpieces(workpieces.filter((w) => w.id !== id));
    }
  };

  const updateWorkpiece = (
    id: string,
    field: "length" | "quantity",
    value: number,
  ) => {
    setWorkpieces(
      workpieces.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    );
  };

  const calculateBillets = (): BilletResult[] => {
    if (!itemExtended) return [];

    let billetLength = itemExtended.length * 1000; // мм

    // Вычитаем торцевой рез в начале
    const actualBilletLength =
      endCut > 0 ? billetLength - endCut : billetLength;

    const validWorkpieces = workpieces.filter(
      (w) => w.length > 0 && w.quantity > 0,
    );

    if (validWorkpieces.length === 0) return [];

    // Объединяем одинаковые длины
    const mergedWorkpieces: { [key: number]: number } = {};
    validWorkpieces.forEach((w) => {
      mergedWorkpieces[w.length] =
        (mergedWorkpieces[w.length] || 0) + w.quantity;
    });

    // Преобразуем обратно в массив и сортируем по длине (от больших к меньшим)
    const sortedWorkpieces = Object.entries(mergedWorkpieces)
      .map(([length, quantity]) => ({ length: Number(length), quantity }))
      .sort((a, b) => b.length - a.length);

    // Остаток для каждого заготовляемого размера
    const remaining: { [key: number]: number } = {};
    sortedWorkpieces.forEach((w) => {
      remaining[w.length] = w.quantity;
    });

    const billets: BilletResult[] = [];
    let billetIndex = 1;
    let totalCuts = 0;

    while (Object.values(remaining).some((r) => r > 0)) {
      let currentBilletLength = actualBilletLength;
      const billetItems: Array<{
        length: number;
        quantity: number;
        workpieces: number;
      }> = [];
      let usedLength = 0;
      let cutsInBillet = endCut > 0 ? 1 : 0; // Торцевой рез в начале (если есть)

      // Сначала размещаем большие заготовки
      for (const workpiece of sortedWorkpieces) {
        const length = workpiece.length;

        while (remaining[length] > 0 && length <= currentBilletLength) {
          currentBilletLength -= length;
          remaining[length]--;
          usedLength += length;
          cutsInBillet++; // Добавляем рез для этой заготовки

          // Вычитаем толщину реза (если есть ещё заготовки)
          if (
            remaining[length] > 0 ||
            Object.values(remaining).some((r) => r > 0)
          ) {
            currentBilletLength -= cutThickness;
          }

          const existingItem = billetItems.find(
            (item) => item.length === length,
          );
          if (existingItem) {
            existingItem.workpieces++;
          } else {
            billetItems.push({ length, quantity: 1, workpieces: 1 });
          }
        }
      }

      // Затем пытаемся заполнить остаток маленькими заготовками
      for (const workpiece of sortedWorkpieces.slice().reverse()) {
        const length = workpiece.length;

        while (remaining[length] > 0 && length <= currentBilletLength) {
          currentBilletLength -= length;
          remaining[length]--;
          usedLength += length;
          cutsInBillet++; // Добавляем рез для этой заготовки

          // Вычитаем толщину реза (если есть ещё заготовки)
          if (
            remaining[length] > 0 ||
            Object.values(remaining).some((r) => r > 0)
          ) {
            currentBilletLength -= cutThickness;
          }

          const existingItem = billetItems.find(
            (item) => item.length === length,
          );
          if (existingItem) {
            existingItem.workpieces++;
          } else {
            billetItems.push({ length, quantity: 1, workpieces: 1 });
          }
        }
      }

      if (billetItems.length > 0) {
        totalCuts += cutsInBillet;
        billets.push({
          billetIndex,
          items: billetItems,
          usedLength,
          billetLength: billetLength,
          endCut,
          totalCuts: cutsInBillet,
        });
        billetIndex++;
      } else {
        // Если ничего не поместилось, пропускаем невходящие размеры
        const minRemaining = Math.min(
          ...Object.entries(remaining)
            .filter(([_, q]) => q > 0)
            .map(([len, _]) => Number(len)),
        );

        // Если минимальный размер больше длины круга, прерываем
        if (minRemaining > actualBilletLength) break;
      }
    }

    return billets;
  };

  const billets = calculateBillets();
  const totalCutsOverall = billets.reduce((sum, b) => sum + b.totalCuts, 0);

  return (
    <article className={cnStyles()}>
      <div className={cnStyles("title-section")}>
        <h1 className={cnStyles("title")}>
          {itemExtended
            ? `${itemExtended?.name} ${itemExtended?.size}`
            : "Загрузка..."}
        </h1>
        {itemExtended && (
          <span className={cnStyles("title-length")}>
            Длина: {itemExtended.length * 1000} мм
          </span>
        )}
      </div>
      <form className={cnStyles("calculator")}>
        <h2 className={cnStyles("section-title")}>Параметры резки</h2>
        <div className={cnStyles("parameters")}>
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="cut-thickness"
              label="Толщина реза, мм"
              placeholder="2"
              className={cnStyles("form-input", "input-parameter")}
              value={cutThickness || ""}
              onChange={(e) =>
                setCutThickness(e.target.value ? Number(e.target.value) : 2)
              }
              disabled={!itemExtended}
            />
          </label>
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="end-cut"
              label="Торцевой рез, мм"
              placeholder="0"
              className={cnStyles("form-input", "input-parameter")}
              value={endCut || ""}
              onChange={(e) =>
                setEndCut(e.target.value ? Number(e.target.value) : 0)
              }
              disabled={!itemExtended}
            />
          </label>
        </div>

        <h2 className={cnStyles("section-title")}>Заготовки</h2>
        <div className={cnStyles("workpieces-list")}>
          {workpieces.map((workpiece) => (
            <div key={workpiece.id} className={cnStyles("workpiece-item")}>
              <label className={cnStyles("form-field")}>
                <MDBInput
                  type="number"
                  name={`length-${workpiece.id}`}
                  label="Длина, мм"
                  placeholder="0"
                  className={cnStyles("form-input", "input-small")}
                  value={workpiece.length || ""}
                  onChange={(e) =>
                    updateWorkpiece(
                      workpiece.id,
                      "length",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  disabled={!itemExtended}
                />
              </label>
              <label className={cnStyles("form-field")}>
                <MDBInput
                  type="number"
                  name={`quantity-${workpiece.id}`}
                  label="Кол-во, шт"
                  placeholder="0"
                  className={cnStyles("form-input", "input-small")}
                  value={workpiece.quantity || ""}
                  onChange={(e) =>
                    updateWorkpiece(
                      workpiece.id,
                      "quantity",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  disabled={!itemExtended}
                />
              </label>
              {workpieces.length > 1 && (
                <button
                  type="button"
                  className={cnStyles("btn-remove")}
                  onClick={() => removeWorkpiece(workpiece.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className={cnStyles("btn-add")}
          onClick={addWorkpiece}
          disabled={!itemExtended}
        >
          + Добавить размер
        </button>

        {billets.length > 0 && (
          <div className={cnStyles("billets-result")}>
            <h3 className={cnStyles("result-title")}>Расчет резки:</h3>
            {billets.map((billet) => {
              const wasteLength =
                billet.billetLength -
                billet.usedLength -
                (endCut > 0 ? endCut : 0) -
                (billet.totalCuts - (endCut > 0 ? 1 : 0) - 1) * cutThickness;
              return (
                <div
                  key={billet.billetIndex}
                  className={cnStyles("billet-item")}
                >
                  <div className={cnStyles("billet-header")}>
                    Круг {billet.billetIndex}: {billet.usedLength} мм от{" "}
                    {billet.billetLength} мм
                  </div>
                  <div className={cnStyles("billet-content")}>
                    {billet.endCut > 0 && (
                      <span className={cnStyles("billet-endcut")}>
                        ТР={billet.endCut}мм
                      </span>
                    )}
                    {billet.items.map((item, idx) => (
                      <span key={idx} className={cnStyles("billet-detail")}>
                        {item.workpieces} шт × {item.length} мм
                      </span>
                    ))}
                    <span className={cnStyles("billet-waste")}>
                      Остаток: {wasteLength} мм
                    </span>
                  </div>
                </div>
              );
            })}
            <div className={cnStyles("total-cuts")}>
              <strong>Всего резов: {totalCutsOverall} шт</strong>
            </div>
          </div>
        )}
      </form>
    </article>
  );
};

export default BilletCellNew;
