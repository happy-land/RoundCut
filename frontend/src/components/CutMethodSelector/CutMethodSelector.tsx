import { FC, useState, useEffect } from 'react';
import block from 'bem-cn';
import './CutMethodSelector.scss';
import {
  CutMethod,
  CuttingService,
} from '../../utils/cutting';

const cnStyles = block('cut-method-selector');

interface ICutMethodSelectorProps {
  diameter: number;
  initialMethod?: CutMethod | null;
  onSelect: (method: CutMethod) => void;
  disabled?: boolean;
}

/**
 * Компонент для выбора метода резки
 * Показывает доступные методы для диаметра и указывает на рекомендуемый
 */
const CutMethodSelector: FC<ICutMethodSelectorProps> = ({
  diameter,
  initialMethod,
  onSelect,
  disabled = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<CutMethod | null>(
    initialMethod || null,
  );

  const availableCuts = CuttingService.getAvailableCuts(diameter);

  // Если нет предварительного выбора, выбираем оптимальный
  useEffect(() => {
    if (!selectedMethod && availableCuts.length > 0) {
      const optimal = availableCuts.find((c) => c.isOptimal);
      if (optimal) {
        setSelectedMethod(optimal.method);
        onSelect(optimal.method);
      }
    }
  }, [diameter]);

  if (availableCuts.length === 0) {
    return (
      <div className={cnStyles()}>
        <p className={cnStyles('error')}>
          Для диаметра {diameter}мм не определены методы резки
        </p>
      </div>
    );
  }

  // Если только один метод доступен, показываем его безопасно
  if (availableCuts.length === 1) {
    return (
      <div className={cnStyles()}>
        <div className={cnStyles('single-method')}>
          <p className={cnStyles('label')}>Метод резки:</p>
          <p className={cnStyles('value')}>
            {availableCuts[0].reason && (
              <span className={cnStyles('badge', 'optimal')}>
                Рекомендуется
              </span>
            )}
            {CuttingService.getCutMethodName(availableCuts[0].method)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cnStyles()}>
      <fieldset className={cnStyles('fieldset')} disabled={disabled}>
        <legend className={cnStyles('legend')}>Выберите метод резки:</legend>
        <div className={cnStyles('methods')}>
          {availableCuts.map((cut) => (
            <label key={cut.method} className={cnStyles('method-option')}>
              <input
                type="radio"
                name="cut-method"
                value={cut.method}
                checked={selectedMethod === cut.method}
                onChange={() => {
                  setSelectedMethod(cut.method);
                  onSelect(cut.method);
                }}
                disabled={disabled}
                className={cnStyles('radio')}
              />
              <span className={cnStyles('option-label')}>
                <span className={cnStyles('method-name')}>
                  {CuttingService.getCutMethodName(cut.method)}
                </span>
                {cut.isOptimal && (
                  <span className={cnStyles('badge', 'optimal')}>
                    Рекомендуется
                  </span>
                )}
                <span className={cnStyles('method-desc')}>
                  {cut.reason}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default CutMethodSelector;
