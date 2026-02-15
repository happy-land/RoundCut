import { FC, useState, useEffect } from "react";
import block from "bem-cn";
import "./BilletCellNew.scss";
import { useFetchItemQuery } from "../../services/priceApi";
import { MDBInput } from "mdb-react-ui-kit";

import { CuttingService, BilletCalculator } from "../../utils/cutting";
import { useSelector } from "react-redux";
import { useCuttingCalculator, useCutMethodSelection } from "../../hooks/useCutting";



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
  

  // const { useFetchItemQuery } = useSelector((state: any) => state.priceApi);
  const { data: itemExtended } = useFetchItemQuery(Number(id));
  const {
    cutThickness,
    setCutThickness,
    endCut,
    setEndCut,
    workpieces,
    addWorkpiece,
    removeWorkpiece,
    updateWorkpiece,
    billets,
    statistics,
    selectedCutMethod,
    setSelectedCutMethod,
  } = useCuttingCalculator({
    billetLength: itemExtended ? itemExtended.length * 1000 : 0,
  });

  const itemDiameter = itemExtended ? itemExtended.size : 0;
  // const {} = useCutMethodSelection(itemDiameter);

  // Состояние для расчета покупки целыми штуками
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyWeight, setBuyWeight] = useState<number>(
    itemExtended
      ? parseFloat(((itemExtended.unitWeight || 0) / 1000).toFixed(3))
      : 0,
  );

  const [buyLength, setBuyLength] = useState<number>(
    itemExtended ? itemExtended.length : 0,
  );

  // Обновляем buyWeight при загрузке itemExtended
  useEffect(() => {
    if (itemExtended) {
      setBuyWeight(
        parseFloat(((itemExtended.unitWeight || 0) / 1000).toFixed(3)),
      );
      setBuyLength(itemExtended.length);
    }
  }, [itemExtended]);


  // Обработчик изменения кол-ва шт для покупки
  const handleBuyQuantityChange = (quantity: number) => {
    if (!itemExtended) return;

    const singleWeightKg = itemExtended.unitWeight || 0;
    const singleLength = itemExtended.length || 0;

    setBuyQuantity(quantity);
    setBuyWeight(parseFloat(((singleWeightKg * quantity) / 1000).toFixed(3)));
    setBuyLength(parseFloat((singleLength * quantity).toFixed(2)));
  };

  // Обработчик изменения веса для покупки
  const handleBuyWeightChange = (weightTons: number) => {
    if (!itemExtended) return;

    const singleWeightKg = itemExtended.unitWeight || 0;
    const singleLength = itemExtended.length || 0;

    if (singleWeightKg === 0) return;

    const weightKg = weightTons * 1000;
    const quantity = Math.round((weightKg / singleWeightKg) * 100) / 100;
    setBuyWeight(weightTons);
    setBuyQuantity(quantity);
    setBuyLength(parseFloat((singleLength * quantity).toFixed(2)));
  };

  // Обработчик изменения длины для покупки
  const handleBuyLengthChange = (length: number) => {
    if (!itemExtended) return;

    const singleWeightKg = itemExtended.unitWeight || 0;
    const singleLength = itemExtended.length || 0;

    if (singleLength === 0) return;

    const quantity = Math.round((length / singleLength) * 100) / 100;
    setBuyLength(length);
    setBuyQuantity(quantity);
    setBuyWeight(parseFloat(((singleWeightKg * quantity) / 1000).toFixed(3)));
  };


  const totalCutsOverall = billets.reduce((sum, b) => sum + b.totalCuts, 0);

  const isValidQuantity = () => {
    return Number.isInteger(buyQuantity) && buyQuantity > 0;
  };

  const handleAddToCart = () => {
    if (isValidQuantity()) {
      // Логика добавления в корзину с buyQuantity
      console.log(`Добавляем в корзину: ${buyQuantity} шт`);
    }
  };

  useEffect(() => {
    // const { CuttingService, BilletCalculator } = require("../../utils/cutting");

    console.log("=== ТЕСТ СИСТЕМЫ РЕЗКИ ===");

    // Тест 1: Маленький диаметр
    console.log("Диаметр 45мм:", CuttingService.getAvailableCuts(45));

    // Тест 2: Средний диаметр
    console.log("Диаметр 60мм:", CuttingService.getAvailableCuts(60));

    // Тест 3: Большой диаметр
    console.log("Диаметр 100мм:", CuttingService.getAvailableCuts(100));

    // Тест 4: Расчет
    const billets = BilletCalculator.calculate(
      [{ id: "1", length: 150, quantity: 5 }],
      6000,
    );
    console.log("Результат расчета:", billets);
  }, []);

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

      <div className={cnStyles("buy-calculator")}>
        <h2 className={cnStyles("section-title")}>Калькулятор покупки</h2>
        <div className={cnStyles("buy-fields")}>
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="buy-quantity"
              label="Кол-во, шт"
              placeholder="0"
              className={cnStyles("form-input", "input-buy")}
              value={buyQuantity || ""}
              onChange={(e) =>
                handleBuyQuantityChange(
                  e.target.value ? Number(e.target.value) : 0,
                )
              }
              disabled={!itemExtended}
              step="1"
              min="0"
            />
          </label>
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="buy-weight"
              label="Кол-во, т"
              placeholder="0"
              className={cnStyles("form-input", "input-buy")}
              value={buyWeight}
              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                let value = e.currentTarget.value.replace(",", ".");

                // Защита от двух нулей подряд в начале
                if (value.match(/^0{2,}/)) {
                  value = value.replace(/^0+/, "0");
                  e.currentTarget.value = value;
                }

                // Если начинается на точку, добавляем 0
                if (value.startsWith(".")) {
                  value = "0" + value;
                  e.currentTarget.value = value;
                }

                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  handleBuyWeightChange(numValue);
                }
              }}
              disabled={!itemExtended}
              step="0.001"
              min="0"
            />
          </label>
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="buy-length"
              label="Кол-во, м"
              placeholder="0"
              className={cnStyles("form-input", "input-buy")}
              value={buyLength || ""}
              onChange={(e) =>
                handleBuyLengthChange(
                  e.target.value ? Number(e.target.value) : 0,
                )
              }
              disabled={!itemExtended}
              step="0.001"
            />
          </label>
        </div>
        <div className={cnStyles("cart-button-container")}>
          <button
            className={cnStyles("btn-add-to-cart", {
              disabled: !isValidQuantity(),
            })}
            onClick={handleAddToCart}
            disabled={!isValidQuantity()}
          >
            В корзину
          </button>
          {!isValidQuantity() && (
            <p className={cnStyles("warning-text")}>
              Добавить в корзину можно только целыми штуками (1, 2, 3 и т.д.)
            </p>
          )}
        </div>
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

