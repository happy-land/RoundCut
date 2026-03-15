/**
 * ПРИМЕР РЕФАКТОРЕННОГО BilletCellNew
 * 
 * ДО: 500+ строк с переплетенной логикой
 * ПОСЛЕ: ~250 строк только UI + использование hooks
 * 
 * Эта версия использует новую систему резки из services/cutting
 */

import { FC, useState, useEffect } from 'react';
import block from 'bem-cn';
import './BilletCellNew.scss';
import { useFetchItemQuery } from '../../services/priceApi';
import { MDBInput } from 'mdb-react-ui-kit';
import { useCuttingCalculator, useCutMethodSelection, usePartSaleInfo } from '../../hooks/useCutting';
import { CuttingService, CutMethod } from '../../utils/cutting';
import CutMethodSelector from '../CutMethodSelector/CutMethodSelector';

const cnStyles = block('billet-cell-new-container');

interface IBilletCellNewProps {
  id: string;
}

const BilletCellNew: FC<IBilletCellNewProps> = ({ id }) => {
  const { data: itemExtended } = useFetchItemQuery(Number(id));

  // ===== СОСТОЯНИЕ КАЛЬКУЛЯТОРА РЕЗКИ (ВСЕ ИЗ HOOK) =====
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
    billetLength: itemExtended?.length * 1000 || 0,
    initialCutThickness: 2,
    initialEndCut: 0,
  });

  // ===== СОСТОЯНИЕ ВЫБОРА МЕТОДА РЕЗКИ =====
  const itemDiameter = itemExtended?.size || 0;
  const { availableMethods, optimalMethod } = useCutMethodSelection(itemDiameter);

  // ===== ИНФОРМАЦИЯ О ПРОДАЖЕ ЧАСТЯМИ =====
  const { canSell: canSellParts, maxLengthPercent } = usePartSaleInfo(itemDiameter);

  // ===== СОСТОЯНИЕ КАЛЬКУЛЯТОРА ПОКУПКИ =====
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyWeight, setBuyWeight] = useState<number>(0);
  const [buyLength, setBuyLength] = useState<number>(0);

  useEffect(() => {
    if (itemExtended) {
      setBuyWeight(parseFloat(((itemExtended.unitWeight || 0) / 1000).toFixed(3)));
      setBuyLength(itemExtended.length);
    }
  }, [itemExtended]);

  // ===== ОБРАБОТЧИКИ КАЛЬКУЛЯТОРА ПОКУПКИ =====
  const handleBuyQuantityChange = (quantity: number) => {
    if (!itemExtended) return;
    const singleWeightKg = itemExtended.unitWeight || 0;
    const singleLength = itemExtended.length || 0;
    setBuyQuantity(quantity);
    setBuyWeight(parseFloat(((singleWeightKg * quantity) / 1000).toFixed(3)));
    setBuyLength(parseFloat((singleLength * quantity).toFixed(2)));
  };

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

  const isValidQuantity = () => {
    return Number.isInteger(buyQuantity) && buyQuantity > 0;
  };

  const handleAddToCart = () => {
    if (isValidQuantity()) {
      console.log(`Добавляем в корзину: ${buyQuantity} шт`);
      if (selectedCutMethod) {
        console.log(`Метод резки: ${CuttingService.getCutMethodDisplayName(selectedCutMethod)}`);
      }
    }
  };

  // ===== РЕНДЕР =====
  return (
    <article className={cnStyles()}>
      {/* ЗАГОЛОВОК */}
      <div className={cnStyles('title-section')}>
        <h1 className={cnStyles('title')}>
          {itemExtended ? `${itemExtended?.name} ${itemExtended?.size}` : 'Загрузка...'}
        </h1>
        {itemExtended && (
          <span className={cnStyles('title-length')}>
            Длина: {itemExtended.length * 1000} мм
          </span>
        )}
      </div>

      {/* КАЛЬКУЛЯТОР ПОКУПКИ */}
      <div className={cnStyles('buy-calculator')}>
        <h2 className={cnStyles('section-title')}>Калькулятор покупки</h2>
        <div className={cnStyles('buy-fields')}>
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="number"
              name="buy-quantity"
              label="Кол-во, шт"
              placeholder="0"
              className={cnStyles('form-input', 'input-buy')}
              value={buyQuantity || ''}
              onChange={(e) => handleBuyQuantityChange(e.target.value ? Number(e.target.value) : 0)}
              disabled={!itemExtended}
              step="1"
              min="0"
            />
          </label>
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="number"
              name="buy-weight"
              label="Кол-во, т"
              placeholder="0"
              className={cnStyles('form-input', 'input-buy')}
              value={buyWeight}
              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                let value = e.currentTarget.value.replace(',', '.');
                if (value.match(/^0{2,}/)) {
                  value = value.replace(/^0+/, '0');
                  e.currentTarget.value = value;
                }
                if (value.startsWith('.')) {
                  value = '0' + value;
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
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="number"
              name="buy-length"
              label="Кол-во, м"
              placeholder="0"
              className={cnStyles('form-input', 'input-buy')}
              value={buyLength || ''}
              onChange={(e) => handleBuyLengthChange(e.target.value ? Number(e.target.value) : 0)}
              disabled={!itemExtended}
              step="0.001"
            />
          </label>
        </div>

        {/* ИНФОРМАЦИЯ ПО МЕТОДАМ РЕЗКИ */}
        {itemExtended && (
          <div className={cnStyles('cutting-info')}>
            <CutMethodSelector
              diameter={itemDiameter}
              initialMethod={optimalMethod?.method}
              onSelect={setSelectedCutMethod}
              disabled={!itemExtended}
            />

            {/* ИНФОРМАЦИЯ О ПРОДАЖЕ ЧАСТЯМИ */}
            {canSellParts && (
              <div className={cnStyles('part-sale-info', 'success')}>
                <p>
                  ✓ Допустима продажа частями (не более {maxLengthPercent}% от длины круга)
                </p>
              </div>
            )}
          </div>
        )}

        <div className={cnStyles('cart-button-container')}>
          <button
            className={cnStyles('btn-add-to-cart', { disabled: !isValidQuantity() })}
            onClick={handleAddToCart}
            disabled={!isValidQuantity()}
          >
            В корзину
          </button>
          {!isValidQuantity() && (
            <p className={cnStyles('warning-text')}>
              Добавить в корзину можно только целыми штуками (1, 2, 3 и т.д.)
            </p>
          )}
        </div>
      </div>

      {/* ПАРАМЕТРЫ РЕЗКИ */}
      <form className={cnStyles('calculator')}>
        <h2 className={cnStyles('section-title')}>Параметры резки</h2>
        <div className={cnStyles('parameters')}>
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="number"
              name="cut-thickness"
              label="Толщина реза, мм"
              placeholder="2"
              className={cnStyles('form-input', 'input-parameter')}
              value={cutThickness || ''}
              onChange={(e) => setCutThickness(e.target.value ? Number(e.target.value) : 2)}
              disabled={!itemExtended}
            />
          </label>
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="number"
              name="end-cut"
              label="Торцевой рез, мм"
              placeholder="0"
              className={cnStyles('form-input', 'input-parameter')}
              value={endCut || ''}
              onChange={(e) => setEndCut(e.target.value ? Number(e.target.value) : 0)}
              disabled={!itemExtended}
            />
          </label>
        </div>

        {/* ЗАГОТОВКИ */}
        <h2 className={cnStyles('section-title')}>Заготовки</h2>
        <div className={cnStyles('workpieces-list')}>
          {workpieces.map((workpiece) => (
            <div key={workpiece.id} className={cnStyles('workpiece-item')}>
              <label className={cnStyles('form-field')}>
                <MDBInput
                  type="number"
                  name={`length-${workpiece.id}`}
                  label="Длина, мм"
                  placeholder="0"
                  className={cnStyles('form-input', 'input-small')}
                  value={workpiece.length || ''}
                  onChange={(e) =>
                    updateWorkpiece(workpiece.id, 'length', e.target.value ? Number(e.target.value) : 0)
                  }
                  disabled={!itemExtended}
                />
              </label>
              <label className={cnStyles('form-field')}>
                <MDBInput
                  type="number"
                  name={`quantity-${workpiece.id}`}
                  label="Кол-во, шт"
                  placeholder="0"
                  className={cnStyles('form-input', 'input-small')}
                  value={workpiece.quantity || ''}
                  onChange={(e) =>
                    updateWorkpiece(workpiece.id, 'quantity', e.target.value ? Number(e.target.value) : 0)
                  }
                  disabled={!itemExtended}
                />
              </label>
              {workpieces.length > 1 && (
                <button
                  type="button"
                  className={cnStyles('btn-remove')}
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
          className={cnStyles('btn-add')}
          onClick={addWorkpiece}
          disabled={!itemExtended}
        >
          + Добавить размер
        </button>

        {/* РЕЗУЛЬТАТЫ РАСЧЕТА */}
        {billets.length > 0 && (
          <div className={cnStyles('billets-result')}>
            <h3 className={cnStyles('result-title')}>Расчет резки:</h3>
            <div className={cnStyles('statistics')}>
              <p>Кругов: {statistics.totalBillets} шт</p>
              <p>Всего резов: {statistics.totalCuts} шт</p>
              <p>Использовано материала: {Math.round(statistics.totalUsedLength)} мм</p>
              <p>Эффективность: {statistics.efficiency}%</p>
            </div>
            {billets.map((billet) => (
              <div key={billet.billetIndex} className={cnStyles('billet-item')}>
                <div className={cnStyles('billet-header')}>
                  Круг {billet.billetIndex}: {billet.usedLength} мм от {billet.billetLength} мм
                </div>
                <div className={cnStyles('billet-content')}>
                  {billet.endCut > 0 && (
                    <span className={cnStyles('billet-endcut')}>ТР={billet.endCut}мм</span>
                  )}
                  {billet.items.map((item, idx) => (
                    <span key={idx} className={cnStyles('billet-detail')}>
                      {item.workpieces} шт × {item.length} мм
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </article>
  );
};

export default BilletCellNew;

/*
 * ===== ЧТО ИЗМЕНИЛОСЬ: =====
 *
 * ✅ УБРАНО:
 *  - Функция calculateBillets (150+ строк) → теперь BilletCalculator.calculate()
 *  - Множество useState для управления workpieces
 *  - Вспомогательные функции для workpieces
 *  - Дублирующиеся расчеты
 *
 * ✅ ДОБАВЛЕНО:
 *  - Hook useCuttingCalculator() - управление всем состоянием
 *  - Hook useCutMethodSelection() - выбор метода резки
 *  - Hook usePartSaleInfo() - информация о продаже частями
 *  - Компонент CutMethodSelector - UI для выбора метода
 *  - Блок информации о методах резки
 *  - Блок информации о продаже частями
 *
 * ✅ УЛУЧШЕНО:
 *  - Логика вынесена в сервисы и утилиты
 *  - Компонент теперь только UI
 *  - Легче читается и тестируется
 *  - Можно переиспользовать логику в других местах
 */
