import { FC, useState, useEffect, useMemo, useRef } from "react";
import block from "bem-cn";
import "./BilletCellNew.scss";
import { useFetchItemQuery } from "../../services/priceApi";
import { MDBInput } from "mdb-react-ui-kit";
import { CuttingService, BilletCalculator } from "../../utils/cutting";
import { useGetCutitemByParametersQuery } from "../../services/cutitemApi"; 
import {
  useCuttingCalculator /*, useCutMethodSelection*/,
} from "../../hooks/useCutting";

const cnStyles = block("billet-cell-new-container");

interface IBilletCellNewProps {
  id: string;
}

interface ItemExtended {
  id: number;
  name: string;
  size: number;
  /** Длина ОДНОЙ штуки, метры */
  length: number;
  /** Масса ОДНОЙ штуки, килограммы */
  unitWeight: number;
}

/* ====================== helpers ====================== */

/** Показывать '' вместо 0, чтобы плавающий лейбл не накладывался на 0 */
const showEmptyIfZero = (v: number | null | undefined) =>
  v === 0 || v == null ? "" : v;

/** Нормализовать пустую строку из инпута в 0 */
const normalizeEmptyToZero = (raw: string) =>
  raw.trim() === "" ? 0 : Number(raw);

/** Парсим десятичный ввод (поддержка запятой), допускаем пустую строку */
const parseDecimalMaybe = (raw: string): number | null => {
  const s = raw.trim();
  if (s === "") return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** Округление до 3 знаков (математическое) для тонн */
const round3 = (x: number) => Math.round(x * 1000) / 1000;
/** Округление до 3 знаков (математическое) для метров */
const round3m = (x: number) => Math.round(x * 1000) / 1000;

/** Вес 1 шт в тоннах */
const tonsPerPiece = (unitWeightKg: number) => unitWeightKg / 1000;

/** Пересчёт из штук */
function deriveByQuantity(
  quantity: number,
  singleWeightKg: number,
  singleLengthM: number,
) {
  const k = Math.max(0, Math.floor(quantity + 0.0000001)); // безопасный floor для неинт. ввода
  const weightTons = round3((singleWeightKg * k) / 1000);
  const lengthMeters = round3m(singleLengthM * k); // ⬅️ округлили метры
  return { quantity: k, weightTons, lengthMeters };
}

type Dir = "up" | "down" | "auto";

/** Притягиваем вес (в тоннах) к кратному шагу stepTons с учётом направления. Возвращаем вес и k. */
const snapWeightToStep = (wTons: number, stepTons: number, dir: Dir) => {
  if (stepTons <= 0) return { wAligned: round3(wTons), k: 0 };
  const q = wTons / stepTons; // «сколько штук» по весу
  const EPS = 1e-9;

  let k: number;
  if (dir === "down") k = Math.floor(q + EPS);
  else if (dir === "up") k = Math.ceil(q - EPS);
  else k = Math.round(q); // auto: ближайшее

  if (k < 0) k = 0;

  const wAligned = round3(k * stepTons);
  return { wAligned, k };
};

/** Пересчёт из тонн (направленный «снэп» к шагу = весу 1 шт). quantity = k (строго целое). */
function deriveByWeightTonsDirected(
  weightTonsIn: number,
  singleWeightKg: number,
  singleLengthM: number,
  dir: Dir,
) {
  const stepT = tonsPerPiece(singleWeightKg); // точный вес 1 шт (т)
  const wIn = round3(Math.max(0, weightTonsIn)); // UI ограничен 3 знаками

  if (singleWeightKg === 0 || stepT === 0) {
    return { quantity: 0, weightTons: wIn, lengthMeters: 0 };
  }

  // прилипание к кратному с учётом направления
  const { wAligned, k } = snapWeightToStep(wIn, stepT, dir);

  // ВАЖНО: количество задаём ровно k (целое), а не через деление веса
  const quantity = k;
  const weightTons = wAligned; // в UI отрисуем .toFixed(3)
  const lengthMeters = round3m(singleLengthM * k); // ⬅️ округлили метры

  return { quantity, weightTons, lengthMeters };
}

/** Пересчёт из метров (здесь допускаем дробные штуки, т.к. ввод произвольный) */
function deriveByLengthMeters(
  lengthMetersIn: number,
  singleWeightKg: number,
  singleLengthM: number,
) {
  const L = Math.max(0, lengthMetersIn);
  if (singleLengthM === 0)
    return { quantity: 0, weightTons: 0, lengthMeters: L };
  const lengthMeters = round3m(L); // ⬅️ фиксируем метры с 3 знаками
  const quantity = lengthMeters / singleLengthM;
  const weightTons = round3((singleWeightKg * quantity) / 1000);
  return { quantity, weightTons, lengthMeters };
}

/* ====================== component ====================== */

const BilletCellNew: FC<IBilletCellNewProps> = ({ id }) => {
  const {
    data: itemExtended,
    isLoading,
    isError,
  } = useFetchItemQuery<ItemExtended | undefined>(Number(id));

  /* --- Cutting calculator --- */
  const billetLengthMm = useMemo(
    () => (itemExtended ? itemExtended.length * 1000 : 0),
    [itemExtended],
  );

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
  } = useCuttingCalculator({ billetLength: billetLengthMm });

  const itemDiameter = useMemo(() => itemExtended?.size ?? 0, [itemExtended]);
  // const {} = useCutMethodSelection(itemDiameter);

  /* --- Purchase calculator (шт/т/м) --- */
  const singleWeightKg = itemExtended?.unitWeight ?? 0; // кг за 1 шт
  const singleLengthM = itemExtended?.length ?? 0; // м за 1 шт

  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyWeightTons, setBuyWeightTons] = useState<number>(0);
  const [buyLengthMeters, setBuyLengthMeters] = useState<number>(0);

  // прошлое значение веса — для определения направления up/down
  const prevWeightTonsRef = useRef(0);

  // Инициализация значений после загрузки itemExtended
  useEffect(() => {
    if (!itemExtended) return;
    const init = deriveByQuantity(1, singleWeightKg, singleLengthM);
    setBuyQuantity(init.quantity); // 1
    setBuyWeightTons(init.weightTons); // вес 1 шт (т), round3
    setBuyLengthMeters(init.lengthMeters); // длина 1 шт (м), round3m
    prevWeightTonsRef.current = init.weightTons;
  }, [itemExtended, singleWeightKg, singleLengthM]);

  // Handlers
  const handleBuyQuantityChange = (raw: string) => {
    const q = normalizeEmptyToZero(raw);
    const { quantity, weightTons, lengthMeters } = deriveByQuantity(
      Number.isFinite(q) ? q : 0,
      singleWeightKg,
      singleLengthM,
    );
    setBuyQuantity(quantity);
    setBuyWeightTons(weightTons);
    setBuyLengthMeters(lengthMeters);
    prevWeightTonsRef.current = weightTons; // зафиксируем для направления
  };

  const handleBuyWeightChange = (raw: string) => {
    const parsed = parseDecimalMaybe(raw);
    if (parsed === null) {
      // Пустой ввод — считаем 0 внутрь и показываем '' через showEmptyIfZero
      setBuyWeightTons(0);
      setBuyQuantity(0);
      setBuyLengthMeters(0);
      prevWeightTonsRef.current = 0;
      return;
    }

    const prev = prevWeightTonsRef.current;
    const dir: Dir = parsed > prev ? "up" : parsed < prev ? "down" : "auto";

    const { quantity, weightTons, lengthMeters } = deriveByWeightTonsDirected(
      parsed,
      singleWeightKg,
      singleLengthM,
      dir,
    );

    setBuyQuantity(quantity); // СТРОГО ЦЕЛОЕ (k)
    setBuyWeightTons(weightTons); // выровненный и round3
    setBuyLengthMeters(lengthMeters); // round3m
    prevWeightTonsRef.current = weightTons;
  };

  const handleBuyWeightBlur = (raw: string) => {
    // На blur — доводим до ближайшего кратного (auto) и 3 знаков
    const parsed = parseDecimalMaybe(raw);
    const safe = parsed == null ? 0 : parsed;
    const { quantity, weightTons, lengthMeters } = deriveByWeightTonsDirected(
      safe,
      singleWeightKg,
      singleLengthM,
      "auto",
    );
    setBuyQuantity(quantity);
    setBuyWeightTons(weightTons);
    setBuyLengthMeters(lengthMeters);
    prevWeightTonsRef.current = weightTons;
  };

  const handleBuyLengthChange = (raw: string) => {
    const m = normalizeEmptyToZero(raw);
    const { quantity, weightTons, lengthMeters } = deriveByLengthMeters(
      Number.isFinite(m) ? m : 0,
      singleWeightKg,
      singleLengthM,
    );
    setBuyQuantity(quantity);
    setBuyWeightTons(weightTons);
    setBuyLengthMeters(lengthMeters);
    prevWeightTonsRef.current = weightTons;
  };

  // Cuts total
  const totalCutsOverall = useMemo(
    () => billets.reduce((sum, b) => sum + b.totalCuts, 0),
    [billets],
  );

  // Корзина: только целые и > 0
  const isValidQuantity = () =>
    Number.isInteger(buyQuantity) && buyQuantity > 0;

  const handleAddToCart = () => {
    if (!isValidQuantity()) return;
    console.log(`Добавляем в корзину: ${buyQuantity} шт`);
    // TODO: интеграция с корзиной
  };

  // Dev logs
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    console.log("=== ТЕСТ СИСТЕМЫ РЕЗКИ ===");
    console.log("Диаметр 45мм:", CuttingService.getAvailableCuts(45));
    console.log("Диаметр 60мм:", CuttingService.getAvailableCuts(60));
    console.log("Диаметр 100мм:", CuttingService.getAvailableCuts(100));
    const testBillets = BilletCalculator.calculate(
      [{ id: "1", length: 150, quantity: 5 }],
      6000,
    );
    console.log("Результат расчета:", testBillets);
  }, []);

  /* --------- UI: загрузка/ошибка --------- */
  if (isLoading) {
    return (
      <article className={cnStyles()}>
        <div className={cnStyles("title-section")}>
          <h1 className={cnStyles("title")}>Загрузка...</h1>
        </div>
      </article>
    );
  }
  if (isError || !itemExtended) {
    return (
      <article className={cnStyles()}>
        <div className={cnStyles("title-section")}>
          <h1 className={cnStyles("title")}>Не удалось загрузить позицию</h1>
        </div>
      </article>
    );
  }

  /* ----------------------------- render ----------------------------- */
  return (
    <article className={cnStyles()}>
      <div className={cnStyles("title-section")}>
        <h1 className={cnStyles("title")}>
          {`${itemExtended.name} ${itemExtended.size}`}
        </h1>
        <span className={cnStyles("title-length")}>
          Длина: {billetLengthMm} мм
        </span>
      </div>

      {/* === Калькулятор покупки === */}
      <div className={cnStyles("buy-calculator")}>
        <h2 className={cnStyles("section-title")}>Калькулятор покупки</h2>
        <div className={cnStyles("buy-fields")}>
          {/* Кол-во, шт */}
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="buy-quantity"
              label="Кол-во, шт"
              placeholder="0"
              className={cnStyles("form-input", "input-buy")}
              value={showEmptyIfZero(buyQuantity)}
              onChange={(e) => handleBuyQuantityChange(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() === "") handleBuyQuantityChange("0");
              }}
              step="1"
              min="0"
            />
          </label>

          {/* Кол-во, т — number со step=0.001. Кратность весу 1 шт обеспечиваем логикой снэпа. */}
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="buy-weight"
              label="Кол-во, т"
              placeholder="0"
              className={cnStyles("form-input", "input-buy")}
              value={buyWeightTons === 0 ? "" : buyWeightTons.toFixed(3)} // ровно 3 знака
              onChange={(e) => handleBuyWeightChange(e.target.value)}
              onBlur={(e) => handleBuyWeightBlur(e.target.value)}
              step={0.001}
              min="0"
              inputMode="decimal"
            />
          </label>

          {/* Кол-во, м */}
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="buy-length"
              label="Кол-во, м"
              placeholder="0"
              className={cnStyles("form-input", "input-buy")}
              value={buyLengthMeters === 0 ? "" : buyLengthMeters.toFixed(3)} // ⬅️ всегда 3 знака
              onChange={(e) => handleBuyLengthChange(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() === "") handleBuyLengthChange("0");
              }}
              step="0.001"
              min="0"
            />
          </label>
        </div>

        {/* 🔹 NEW: карточки видов резки с + / – и ценой из БД */}
        {itemDiameter > 0 && availableCuts.length > 0 && (
          <section className={cnStyles("cutting-methods")}>
            <h3 className={cnStyles("cutting-title")}>
              Виды резки для Ø{itemDiameter} мм
              {recommendedCutLabel ? (
                <span className={cnStyles("cutting-hint")}>
                  {" "}
                  (рекомендуется: {recommendedCutLabel})
                </span>
              ) : null}
            </h3>

            <div className={cnStyles("cutting-grid")}>
              {availableCuts.map((m) => {
                const price = priceByCode[m.code];
                const qty = cutCounts[m.code] ?? 0;
                const priceText = isCutPriceLoading
                  ? "Загрузка..."
                  : isCutPriceError
                    ? "—"
                    : typeof price === "number"
                      ? formatMoney(price, priceCurrency)
                      : "—";

                return (
                  <div key={m.code} className={cnStyles("cutting-card")}>
                    <div className={cnStyles("cutting-card__header")}>
                      <div className={cnStyles("cutting-card__label")}>
                        {m.label}
                      </div>
                      <div className={cnStyles("cutting-card__price")}>
                        {priceText}{" "}
                        <span className={cnStyles("cutting-card__unit")}>
                          / рез
                        </span>
                      </div>
                    </div>

                    <div className={cnStyles("cutting-card__controls")}>
                      <button
                        type="button"
                        className={cnStyles("btn-qty", { minus: true })}
                        onClick={() => decCut(m.code)}
                        aria-label={`Уменьшить ${m.label}`}
                      >
                        –
                      </button>

                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={999}
                        className={cnStyles("qty-input")}
                        value={qty}
                        onChange={(e) =>
                          setCutDirect(m.code, Number(e.target.value || 0))
                        }
                      />

                      <button
                        type="button"
                        className={cnStyles("btn-qty", { plus: true })}
                        onClick={() => incCut(m.code)}
                        aria-label={`Увеличить ${m.label}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Итого по резке */}
            <div className={cnStyles("cutting-total")}>
              <span>Итого за резку:</span>
              <strong>
                {isCutPriceLoading
                  ? "Загрузка..."
                  : totalCuttingCost > 0
                    ? formatMoney(totalCuttingCost, priceCurrency)
                    : formatMoney(0, priceCurrency)}
              </strong>
            </div>
          </section>
        )}

        {/* Кнопка корзины */}
        <div className={cnStyles("cart-button-container")}>
          <button
            type="button"
            className={cnStyles("btn-add-to-cart", {
              disabled: !isValidQuantity(),
            })}
            onClick={handleAddToCart}
            disabled={!isValidQuantity()}
            title={
              !isValidQuantity()
                ? "Добавить в корзину можно только целыми штуками"
                : undefined
            }
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

      {/* === Калькулятор резки === */}
      <form
        className={cnStyles("calculator")}
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className={cnStyles("section-title")}>Параметры резки</h2>
        <div className={cnStyles("parameters")}>
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="cut-thickness"
              label="Толщина реза, мм"
              placeholder="2"
              className={cnStyles("form-input", "input-parameter")}
              value={showEmptyIfZero(cutThickness)}
              onChange={(e) => {
                const val = e.target.value.trim();
                setCutThickness(val === "" ? 0 : Number(val));
              }}
              onBlur={(e) => {
                if (e.target.value.trim() === "") setCutThickness(0);
              }}
              min="0"
              step="0.1"
            />
          </label>

          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="end-cut"
              label="Торцевой рез, мм"
              placeholder="0"
              className={cnStyles("form-input", "input-parameter")}
              value={showEmptyIfZero(endCut)}
              onChange={(e) => {
                const val = e.target.value.trim();
                setEndCut(val === "" ? 0 : Number(val));
              }}
              onBlur={(e) => {
                if (e.target.value.trim() === "") setEndCut(0);
              }}
              min="0"
              step="0.1"
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
                  value={showEmptyIfZero(workpiece.length)}
                  onChange={(e) =>
                    updateWorkpiece(
                      workpiece.id,
                      "length",
                      normalizeEmptyToZero(e.target.value),
                    )
                  }
                  onBlur={(e) => {
                    if (e.target.value.trim() === "")
                      updateWorkpiece(workpiece.id, "length", 0);
                  }}
                  min="0"
                  step="1"
                />
              </label>

              <label className={cnStyles("form-field")}>
                <MDBInput
                  type="number"
                  name={`quantity-${workpiece.id}`}
                  label="Кол-во, шт"
                  placeholder="0"
                  className={cnStyles("form-input", "input-small")}
                  value={showEmptyIfZero(workpiece.quantity)}
                  onChange={(e) =>
                    updateWorkpiece(
                      workpiece.id,
                      "quantity",
                      normalizeEmptyToZero(e.target.value),
                    )
                  }
                  onBlur={(e) => {
                    if (e.target.value.trim() === "")
                      updateWorkpiece(workpiece.id, "quantity", 0);
                  }}
                  min="0"
                  step="1"
                />
              </label>

              {workpieces.length > 1 && (
                <button
                  type="button"
                  className={cnStyles("btn-remove")}
                  onClick={() => removeWorkpiece(workpiece.id)}
                  aria-label="Удалить заготовку"
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
        >
          + Добавить размер
        </button>

        {billets.length > 0 && (
          <div className={cnStyles("billets-result")}>
            <h3 className={cnStyles("result-title")}>Расчет резки:</h3>
            {billets.map((billet) => {
              const cutsWithoutEnd =
                billet.totalCuts - (endCut > 0 ? 1 : 0) - 1;
              const technicalCuts = Math.max(0, cutsWithoutEnd);
              const wasteLength = Math.max(
                0,
                billet.billetLength -
                  billet.usedLength -
                  (endCut > 0 ? endCut : 0) -
                  technicalCuts * cutThickness,
              );

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
