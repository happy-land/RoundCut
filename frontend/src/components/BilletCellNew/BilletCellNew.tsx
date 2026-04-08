import { FC, useState, useEffect, useMemo, useRef } from "react";
import block from "bem-cn";
import "./BilletCellNew.scss";
import { useFetchItemQuery } from "../../services/priceApi";
import { MDBInput } from "mdb-react-ui-kit";
import { CuttingService, BilletCalculator, CutMethod } from "../../utils/cutting";
import { useGetCutitemsByParametersQuery } from "../../services/cutitemApi";
import {
  useCuttingCalculator /*, useCutMethodSelection*/,
} from "../../hooks/useCutting";
import { useGetMarkupByWarehouseIdQuery } from "../../services/markupApi";
import { mapWeightToLevel } from "../../utils/markupMapping";
import { useAddCartItemMutation } from "../../services/cartApi";
import { CUT_CODE_LABELS } from "../../utils/constants";
import { TBilletCartData } from "../../utils/types";
import { useAppDispatch } from "../../app/hooks";
import { addGuestCartItem } from "../../features/guestCart/guestCartSlice";
import { getCookie } from "../../utils/cookie";
import { useGetSettingsQuery } from "../../services/settingsApi";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../features/toast/toastSlice";

const cnStyles = block("billet-cell-new-container");

interface IBilletCellNewProps {
  id: string; // id товара (product)
  warehouseId: number; // id склада для получения cutitem
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

/** Функция форматирования денег */
const formatMoney = (value: number, currency: string) => {
  return `${value.toFixed(0)} ${currency}`;
};

/* ====================== component ====================== */

const BilletCellNew: FC<IBilletCellNewProps> = ({ id, warehouseId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [addCartItem] = useAddCartItemMutation();
  const guest = !getCookie("accessToken");
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

  const itemDiameter = useMemo(() => {
    const size = itemExtended?.size ?? 0;
    return typeof size === "string" ? parseInt(size, 10) : size;
  }, [itemExtended]);

  /* --- Purchase calculator (шт/т/м) --- */
  const singleWeightKg = itemExtended?.unitWeight ?? 0; // кг за 1 шт
  const singleLengthM = itemExtended?.length ?? 0; // м за 1 шт

  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyWeightTons, setBuyWeightTons] = useState<number>(0);
  const [buyLengthMeters, setBuyLengthMeters] = useState<number>(0);
  const [cutCounts, setCutCounts] = useState<Record<string, number>>({});
  // Для цены резки нужно получить из API
  const [priceByCode, setPriceByCode] = useState<Record<string, number>>({});
  const [isCutPriceLoading, setIsCutPriceLoading] = useState(false);
  const [isCutPriceError, setIsCutPriceError] = useState(false);
  const priceCurrency = "₽";

  // Настройки из БД (с fallback-значениями на время загрузки)
  const { data: appSettings } = useGetSettingsQuery();
  const BILLET_MARKUP_PERCENT = Number(appSettings?.billet_markup_percent ?? 0.12);
  const MIN_BILLET_MARKUP_RUB = Number(appSettings?.min_billet_markup_rub ?? 1999);
  /** Диаметр от 80 мм — можно продавать часть круга; меньше — только целыми штуками */
  const MIN_DIAMETER_FOR_PARTIAL = 80;
  const canSellPartial = itemDiameter >= MIN_DIAMETER_FOR_PARTIAL;

  // Получить цены резки для данного склада и диаметра
  const { data: cutitemsForDiameter } = useGetCutitemsByParametersQuery(
    { warehouseId, sizeNum: itemDiameter },
    { skip: itemDiameter === 0 },
  );

  // Получить наценки по складу
  const { data: markup } = useGetMarkupByWarehouseIdQuery(warehouseId);

  // Выберем правильную базовую цену в зависимости от веса
  const getBasePrice = (weight: number): number => {
    if (weight >= 15) return Number(itemExtended?.pricePer15tn ?? 0);
    if (weight >= 5) return Number(itemExtended?.pricePer5tn ?? 0);
    return Number(itemExtended?.pricePer1tn ?? 0);
  };

  // Расчёт цены за тонну с наценкой за малотоннажность
  const pricePerTon = useMemo(() => {
    if (!itemExtended || !markup || buyWeightTons === 0) return 0;

    const basePrice = getBasePrice(buyWeightTons);
    console.log("basePrice", basePrice);
    const level = mapWeightToLevel(buyWeightTons);

    if (level < 1 || level > 8) return basePrice; // если вес вне диапазонов

    const markupKey = `level${level}` as keyof typeof markup;
    const markupCoeff = markup[markupKey] ?? 0;
    console.log("markupCoeff", Number(markupCoeff));

    return basePrice + Number(markupCoeff);
  }, [buyWeightTons, itemExtended, markup]);

  // Сумма за товар
  const totalGoodsPrice = useMemo(() => {
    return pricePerTon * buyWeightTons;
  }, [pricePerTon, buyWeightTons]);

  // Вес используемой части (из блока Параметры резки), тонн
  const partWeightTons = useMemo(() => {
    if (billets.length === 0 || billetLengthMm === 0 || singleWeightKg === 0)
      return 0;
    const totalUsedMm = billets.reduce((sum, b) => sum + b.usedLength, 0);
    return round3((totalUsedMm / billetLengthMm) * (singleWeightKg / 1000));
  }, [billets, billetLengthMm, singleWeightKg]);

  // Количество целых кругов.
  // Если диаметр < 80мм — всегда все круги целые (частичная продажа запрещена).
  // Иначе: проверяем последний круг по РЕАЛЬНО ПОТРЕБЛЁННОЙ длине (с учётом резов).
  // >50% — целый, ≤50% — часть.
  const numCompleteCircles = useMemo(() => {
    if (billets.length === 0) return 0;
    if (!canSellPartial) return billets.length; // только целые штуки

    const lastBillet = billets[billets.length - 1];
    const nPiecesLast = lastBillet.totalCuts - (lastBillet.endCut > 0 ? 1 : 0);
    const consumedLast =
      lastBillet.usedLength +
      lastBillet.endCut +
      Math.max(0, nPiecesLast - 1) * cutThickness;
    const lastBilletUsagePercent = (consumedLast / lastBillet.billetLength) * 100;
    const isLastBilletWhole = lastBilletUsagePercent > 50;
    return isLastBilletWhole ? billets.length : Math.max(0, billets.length - 1);
  }, [billets, canSellPartial, cutThickness]);

  // Процент использования от целого круга - УДАЛЕНО
  
  // Выяснить: продаем часть или весь круг? - УДАЛЕНО

  // Вес целых кругов (тонны)
  const wholeCirclesWeight = useMemo(() => {
    const weightPerCircle = singleWeightKg / 1000;
    return numCompleteCircles * weightPerCircle;
  }, [numCompleteCircles, singleWeightKg]);

  // Вес части (тонны) - только последний круг, если он часть.
  // Учитываем реально потреблённую длину: заготовки + торцевой рез + резы между заготовками.
  const partWeight = useMemo(() => {
    if (numCompleteCircles >= billets.length) return 0;

    const lastBillet = billets[billets.length - 1];
    const nPiecesLast = lastBillet.totalCuts - (lastBillet.endCut > 0 ? 1 : 0);
    const consumedLast =
      lastBillet.usedLength +
      lastBillet.endCut +
      Math.max(0, nPiecesLast - 1) * cutThickness;
    const clampedConsumed = Math.min(consumedLast, billetLengthMm);
    return round3((clampedConsumed / billetLengthMm) * (singleWeightKg / 1000));
  }, [billets, numCompleteCircles, billetLengthMm, singleWeightKg, cutThickness]);

  // Цена за тонну целых кругов (базовая + малотоннажность, БЕЗ наценки на часть)
  const wholeCirclesPricePerTon = useMemo(() => {
    if (!itemExtended || !markup || wholeCirclesWeight === 0) return 0;
    const basePrice = getBasePrice(wholeCirclesWeight);
    const level = mapWeightToLevel(wholeCirclesWeight);
    if (level < 1 || level > 8) return basePrice;
    const markupKey = `level${level}` as keyof typeof markup;
    return basePrice + Number(markup[markupKey] ?? 0);
  }, [wholeCirclesWeight, itemExtended, markup]);

  // Стоимость целых кругов
  const wholeCirclesCost = useMemo(() => {
    if (wholeCirclesWeight === 0) return 0;
    return wholeCirclesPricePerTon * wholeCirclesWeight;
  }, [wholeCirclesPricePerTon, wholeCirclesWeight]);

  // Цена за тонну части (базовая + малотоннажность + 12% наценка, округление вверх до 100 руб)
  const partPricePerTon = useMemo(() => {
    if (!itemExtended || !markup || partWeight === 0) return 0;
    const basePrice = getBasePrice(partWeight);
    const level = mapWeightToLevel(partWeight);
    if (level < 1 || level > 8) return basePrice;
    const markupKey = `level${level}` as keyof typeof markup;
    const priceWithMarkup = (basePrice + Number(markup[markupKey] ?? 0)) * (1 + BILLET_MARKUP_PERCENT);
    // Округляем вверх до 100 руб
    return Math.ceil(priceWithMarkup / 100) * 100;
  }, [partWeight, itemExtended, markup]);

  // Стоимость части.
  // partPricePerTon уже включает 12% и округлен вверх до 100 руб.
  // Если даже после округления 12%-надбавка меньше MIN_BILLET_MARKUP_RUB,
  // прибавляем минимум к базовой цене (без 12%) и снова округляем цену/тн вверх до 100.
  const partCost = useMemo(() => {
    if (partWeight === 0) return 0;
    const basePrice = getBasePrice(partWeight);
    const level = mapWeightToLevel(partWeight);
    const markupKey = level >= 1 && level <= 8 ? `level${level}` as keyof typeof markup : null;
    const rawPrice = markupKey && markup ? basePrice + Number(markup[markupKey] ?? 0) : basePrice;
    const rawCost = rawPrice * partWeight;
    const markupAdded12 = rawCost * BILLET_MARKUP_PERCENT;
    if (markupAdded12 < MIN_BILLET_MARKUP_RUB) {
      // Минимальная надбавка: база + 1999 ₽, округлённая цена/тн — вверх до 100
      const minCost = rawCost + MIN_BILLET_MARKUP_RUB;
      // Пересчитываем partPricePerTon на основе minCost, чтобы оно тоже было округлённым
      const minPricePerTon = Math.ceil((minCost / partWeight) / 100) * 100;
      return minPricePerTon * partWeight;
    }
    return partPricePerTon * partWeight;
  }, [partWeight, partPricePerTon, itemExtended, markup]);

  // Итоговая стоимость товара (целые круги + часть)
  const billetGoodsCost = useMemo(() => {
    return wholeCirclesCost + partCost;
  }, [wholeCirclesCost, partCost]);

  // Доступные типы резки для текущего диаметра
  const availableCuts = useMemo(() => {
    const cuts = CuttingService.getAvailableCuts(itemDiameter);
    return cuts.map((cut) => ({
      code: cut.method,
      label: CuttingService.getCutMethodName(cut.method as CutMethod),
      isOptimal: cut.isOptimal,
    }));
  }, [itemDiameter]);

  // Заполнить priceByCode из cutitems
  useEffect(() => {
    if (!cutitemsForDiameter || cutitemsForDiameter.length === 0) {
      setPriceByCode({});
      return;
    }

    const prices: Record<string, number> = {};
    cutitemsForDiameter.forEach((cutitem) => {
      if (cutitem.cut?.code) {
        prices[cutitem.cut.code] = cutitem.amount;
      }
    });
    setPriceByCode(prices);
  }, [cutitemsForDiameter, availableCuts]);

  const incCut = (code: string) => {
    setCutCounts((prev) => ({
      ...prev,
      [code]: (prev[code] ?? 0) + 1,
    }));
  };

  const decCut = (code: string) => {
    setCutCounts((prev) => ({
      ...prev,
      [code]: Math.max(0, (prev[code] ?? 0) - 1),
    }));
  };

  const setCutDirect = (code: string, value: number) => {
    setCutCounts((prev) => ({
      ...prev,
      [code]: Math.max(0, value),
    }));
  };

  const totalCuttingCost = useMemo(() => {
    return Object.entries(cutCounts).reduce((sum, [code, qty]) => {
      const price = priceByCode[code] ?? 0;
      return sum + price * qty;
    }, 0);
  }, [cutCounts, priceByCode]);

  // Рекомендуемый тип резки
  const recommendedCutLabel = useMemo(() => {
    const optimal = CuttingService.getOptimalCut(itemDiameter);
    return optimal ? CuttingService.getCutMethodName(optimal.method) : null;
  }, [itemDiameter]);

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

  // Стоимость резки для блока Параметры (оптимальный метод × totalCutsOverall)
  const cuttingCostForBillets = useMemo(() => {
    const optimal = CuttingService.getOptimalCut(itemDiameter);
    if (!optimal) return 0;
    return (priceByCode[optimal.method] ?? 0) * totalCutsOverall;
  }, [totalCutsOverall, itemDiameter, priceByCode]);

  // Корзина: только целые и > 0
  const isValidQuantity = () =>
    Number.isInteger(buyQuantity) && buyQuantity > 0;

  // Активная вкладка
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

  const handleAddToCart = async () => {
    if (!isValidQuantity() || !itemExtended) return;
    const cuttingDescription =
      Object.entries(cutCounts)
        .filter(([, qty]) => qty > 0)
        .map(([code, qty]) => `${CUT_CODE_LABELS[code] ?? code}: ${qty} шт`)
        .join(", ") || null;
    const payload = {
      priceitemId: itemExtended.id,
      name: itemExtended.name,
      size: String(itemExtended.size),
      quantity: buyQuantity,
      weightTons: buyWeightTons,
      pricePerTon,
      totalGoodsPrice,
      totalCuttingCost,
      cuttingDescription: cuttingDescription ?? undefined,
    };
    if (guest) {
      dispatch(addGuestCartItem(payload));
    } else {
      await addCartItem(payload);
    }
    dispatch(showToast({ message: 'Добавлено в корзину' }));
    navigate(-1);
  };

  const handleAddBilletToCart = async () => {
    if (billets.length === 0 || !itemExtended) return;
    const totalWeightTons = round3(wholeCirclesWeight + partWeight);
    const avgPricePerTon =
      totalWeightTons > 0
        ? Math.round((billetGoodsCost) / totalWeightTons)
        : 0;
    const billetData: TBilletCartData = {
      cutThickness,
      endCut,
      workpieces: workpieces
        .filter((w) => w.length > 0 && w.quantity > 0)
        .map((w) => ({ length: w.length, quantity: w.quantity })),
      numCircles: billets.length,
      numCompleteCircles,
      wholeCirclesWeight,
      wholeCirclesPricePerTon: wholeCirclesWeight > 0
        ? Math.round(wholeCirclesCost / wholeCirclesWeight)
        : 0,
      partWeight,
      partPricePerTon,
      billetGoodsCost,
      cuttingCostForBillets,
      totalCuts: totalCutsOverall,
    };
    // human-readable описание для старых клиентов / поиска
    const cuttingDescription =
      billetData.workpieces
        .map((w) => `${w.length}×${w.quantity}шт`)
        .join(", ") +
      ` | рез ${cutThickness}мм` +
      (endCut > 0 ? ` | торец ${endCut}мм` : "");
    const payload = {
      priceitemId: itemExtended.id,
      name: itemExtended.name,
      size: String(itemExtended.size),
      quantity: billets.length,
      weightTons: totalWeightTons,
      pricePerTon: avgPricePerTon,
      totalGoodsPrice: billetGoodsCost,
      totalCuttingCost: cuttingCostForBillets,
      cuttingDescription,
      billetData,
    };
    if (guest) {
      dispatch(addGuestCartItem(payload));
    } else {
      await addCartItem(payload);
    }
    dispatch(showToast({ message: 'Добавлено в корзину' }));
    navigate(-1);
  };

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

      {/* === Вкладки === */}
      <div className={cnStyles("tabs")}>
        <button
          type="button"
          className={cnStyles("tab", { active: activeTab === 'simple' })}
          onClick={() => setActiveTab('simple')}
        >
          Покупка
        </button>
        <button
          type="button"
          className={cnStyles("tab", { active: activeTab === 'advanced' })}
          onClick={() => setActiveTab('advanced')}
        >
          Расчёт заготовок
        </button>
      </div>

      {/* === Калькулятор покупки === */}
      {activeTab === 'simple' && (
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

        {/* === Расчёт цены за товар === */}
        <div className={cnStyles("price-calculation")}>
          <h3 className={cnStyles("price-title")}>Расчёт цены</h3>
          <div className={cnStyles("price-rows")}>
            <div className={cnStyles("price-row")}>
              <span className={cnStyles("price-label")}>
                Цена за тонну (с наценкой):
              </span>
              <span className={cnStyles("price-value")}>
                {pricePerTon.toFixed(0)} ₽/тн
              </span>
            </div>
            <div className={cnStyles("price-row")}>
              <span className={cnStyles("price-label")}>Сумма за товар:</span>
              <span className={cnStyles("price-value", { total: true })}>
                {totalGoodsPrice.toFixed(0)} ₽
              </span>
            </div>
          </div>
        </div>

        {/* 🔹 NEW: карточки видов резки с + / – и ценой из БД */}
        {itemDiameter > 0 && availableCuts.length > 0 && (
          <section className={cnStyles("cutting-methods")}>
            <div className={cnStyles("cutting-grid")}>
              {availableCuts
                .filter((m) => {
                  const hasPrice =
                    priceByCode[m.code] !== undefined &&
                    priceByCode[m.code] > 0;
                  return hasPrice;
                })
                .map((m) => {
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

        {/* === Итого за круг и резку === */}
        <div className={cnStyles("grand-total")}>
          <span className={cnStyles("grand-total__label")}>
            Итого за круг и резку:
          </span>
          <span className={cnStyles("grand-total__amount")}>
            {(totalGoodsPrice + totalCuttingCost).toFixed(0)} ₽
          </span>
        </div>

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
      )} {/* end simple tab */}

      {/* === Калькулятор резки === */}
      {activeTab === 'advanced' && (
      <form
        className={cnStyles("calculator")}
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Баннер режима продажи */}
        <div className={cnStyles("sell-mode-banner", { partial: canSellPartial, whole: !canSellPartial })}>
          {canSellPartial ? (
            <>
              <span className={cnStyles("sell-mode-banner__icon")}>✓</span>
              <span>
                <strong>Частичная продажа доступна</strong> — диаметр ≥ {MIN_DIAMETER_FOR_PARTIAL} мм, можно купить часть круга
              </span>
            </>
          ) : (
            <>
              <span className={cnStyles("sell-mode-banner__icon")}>⚠</span>
              <span>
                <strong>Только целыми штуками</strong> — диаметр {itemDiameter} мм меньше {MIN_DIAMETER_FOR_PARTIAL} мм, части круга не продаются
              </span>
            </>
          )}
        </div>

        <h2 className={cnStyles("section-title")}>Параметры резки</h2>
        <div className={cnStyles("parameters")}>
          <label className={cnStyles("form-field")}>
            <MDBInput
              type="number"
              name="cut-thickness"
              label="Толщина реза, мм"
              placeholder="5"
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
              step="1"
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

              const nPiecesBillet = billet.totalCuts - (billet.endCut > 0 ? 1 : 0);
              const consumedBillet = Math.min(
                billet.usedLength +
                  billet.endCut +
                  Math.max(0, nPiecesBillet - 1) * cutThickness,
                billet.billetLength,
              );

              return (
                <div
                  key={billet.billetIndex}
                  className={cnStyles("billet-item")}
                >
                  <div className={cnStyles("billet-header")}>
                    Круг {billet.billetIndex}: {consumedBillet} мм из{" "}
                    {billet.billetLength} мм
                    {cutThickness > 0 && nPiecesBillet > 1 && (
                      <span className={cnStyles("billet-header__kerfs")}>
                        &nbsp;(резы:{" "}
                        {Math.max(0, nPiecesBillet - 1) * cutThickness} мм)
                      </span>
                    )}
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
            {partWeightTons > 0 && (
              <div className={cnStyles("billet-price-summary")}>
                <h4 className={cnStyles("billet-price-summary__title")}>
                  РАСЧЕТ СТОИМОСТИ
                </h4>
                {numCompleteCircles > 0 && (
                  <>
                    <div className={cnStyles("billet-price-summary__section")}>
                      <div className={cnStyles("billet-price-summary__row")}>
                        <span>Целые круги ({numCompleteCircles} шт):</span>
                        <strong>{wholeCirclesWeight.toFixed(3)} т</strong>
                      </div>
                      <div className={cnStyles("billet-price-summary__row")}>
                        <span>Цена за тонну:</span>
                        <strong>
                          {wholeCirclesWeight > 0
                            ? (wholeCirclesCost / wholeCirclesWeight).toFixed(0)
                            : "—"}{" "}
                          ₽/тн
                        </strong>
                      </div>
                      <div className={cnStyles("billet-price-summary__row")}>
                        <span>Стоимость целых кругов:</span>
                        <strong>{wholeCirclesCost.toFixed(0)} ₽</strong>
                      </div>
                    </div>
                  </>
                )}
                {partWeight > 0 && (
                  <div className={cnStyles("billet-price-summary__section")}>
                    <div className={cnStyles("billet-price-summary__row")}>
                      <span>Масса части:</span>
                      <strong>{partWeight.toFixed(3)} т</strong>
                    </div>
                    <div className={cnStyles("billet-price-summary__row")}>
                      <span>Цена за тонну:</span>
                      <strong>
                        {partWeight > 0
                          ? (partCost / partWeight % 100 === 0
                              ? partCost / partWeight
                              : Math.ceil(partCost / partWeight / 100) * 100
                            ).toFixed(0)
                          : "—"}{" "}
                        ₽/тн
                      </strong>
                    </div>
                    <div className={cnStyles("billet-price-summary__row")}>
                      <span>Стоимость части:</span>
                      <strong>{partCost.toFixed(0)} ₽</strong>
                    </div>
                  </div>
                )}
                <div className={cnStyles("billet-price-summary__row")}>
                  <span>Стоимость товара:</span>
                  <strong>{billetGoodsCost.toFixed(0)} ₽</strong>
                </div>
                <div className={cnStyles("billet-price-summary__row")}>
                  <span>Стоимость резки ({totalCutsOverall} рез.):</span>
                  <strong>{cuttingCostForBillets.toFixed(0)} ₽</strong>
                </div>
                <div
                  className={cnStyles("billet-price-summary__row", {
                    total: true,
                  })}
                >
                  <span>Итого:</span>
                  <strong>
                    {(billetGoodsCost + cuttingCostForBillets).toFixed(0)} ₽
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Кнопка "Добавить в корзину" для расчёта заготовок */}
        {billets.length > 0 && partWeightTons > 0 && (
          <div className={cnStyles("cart-button-container")}>
            <button
              type="button"
              className={cnStyles("btn-add-to-cart")}
              onClick={handleAddBilletToCart}
            >
              Добавить расчёт в корзину
            </button>
          </div>
        )}
      </form>
      )} {/* end advanced tab */}
    </article>
  );
};

export default BilletCellNew;
