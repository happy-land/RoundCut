import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAvailableGrades, selectActiveGrades, updateActiveGrades } from '../../features/filter/steelgradeSlice';
import { selectDiameter, updateSelectedDiameters } from '../../features/filter/diameterSlice';
import { useFetchItemsQuery } from '../../services/priceApi';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
import { selectSearchQuery } from '../../features/search/searchSlice';
import block from 'bem-cn';
import './OptionsPickerModal.scss';

const cnStyles = block('options-picker');

const OptionsPickerModal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const options: string[] = useAppSelector(selectAvailableGrades);
  const activeGrades = useAppSelector(selectActiveGrades);
  const selectedDiameters = useAppSelector(selectDiameter);
  const warehouseId = useAppSelector(selectWarehouseId);

  const { data: items = [] } = useFetchItemsQuery(warehouseId);
  const searchQuery = useAppSelector(selectSearchQuery);

  // Local staged selections — changes only applied on "Применить"
  const [localActiveGrades, setLocalActiveGrades] = useState<string[]>(activeGrades || []);
  const [localSelectedDiameters, setLocalSelectedDiameters] = useState<string[]>(selectedDiameters || []);

  // Keep local state in sync when modal opens or when store changes externally
  useEffect(() => {
    setLocalActiveGrades(activeGrades || []);
  }, [activeGrades]);

  useEffect(() => {
    setLocalSelectedDiameters(selectedDiameters || []);
  }, [selectedDiameters]);

  const handleCloseModal = () => {
    navigate(-1); // Close modal when the close icon is clicked
  };

  // Разбить массив марок на строки по 3 элемента
  const rows: string[][] = [];
  for (let i = 0; i < options.length; i += 3) {
    rows.push(options.slice(i, i + 3));
  }

  // Compute available diameters based on active grades (or all if none selected)
  const computeDiameters = (): string[] => {
    // We filter items first by the selected product type (searchQuery)
    // e.g. if user entered "Круг" or "Поковка" in the search, only consider those items.
    const type = (searchQuery || '').trim().toLowerCase();

    const filtered = items.filter((item: any) => {
      // if a product type is specified in the search input, require the item to start with it
      if (type) {
        if (!item.name || !item.name.toLowerCase().startsWith(type)) return false;
      }

      // grade check (existing behaviour)
      const [, ...rest] = item.name.split(' ');
      const grade = rest.join(' ').trim();
      if (localActiveGrades && localActiveGrades.length > 0) {
        return localActiveGrades.includes(grade);
      }
      return true;
    });

    const set = new Set<string>();
    filtered.forEach((item: any) => {
      if (!item.size) return;
      // remove mm suffix and trim
      let dia = item.size.replace(/мм\.?/gi, '').trim();

      // If no specific type is requested (empty searchQuery) - include the full size string
      if (!type) {
        if (dia) set.add(dia);
        return;
      }

      // If a type is specified, try to normalize to a numeric diameter/size (leading number)
      const match = dia.match(/^\d+[\.,]?\d*/);
      if (!match) return;
      dia = match[0];

      if (dia) set.add(dia);
    });

    // sort numerically when possible
    return Array.from(set).sort((a, b) => {
      const na = parseFloat(a.replace(',', '.')) || 0;
      const nb = parseFloat(b.replace(',', '.')) || 0;
      return na - nb;
    });
  };

  const diameters = computeDiameters();

  const toggleGrade = (grade: string) => {
    const next = localActiveGrades && localActiveGrades.includes(grade)
      ? localActiveGrades.filter((g) => g !== grade)
      : [...(localActiveGrades || []), grade];
    setLocalActiveGrades(next);
  };

  const toggleDiameter = (size: string) => {
    const next = localSelectedDiameters && localSelectedDiameters.includes(size)
      ? localSelectedDiameters.filter((s) => s !== size)
      : [...(localSelectedDiameters || []), size];
    setLocalSelectedDiameters(next);
  };

  const handleApply = () => {
    dispatch(updateActiveGrades(localActiveGrades));
    dispatch(updateSelectedDiameters(localSelectedDiameters));
    navigate(-1);
  };

  const handleCancel = () => {
    // revert local changes by resetting from store
    setLocalActiveGrades(activeGrades || []);
    setLocalSelectedDiameters(selectedDiameters || []);
    navigate(-1);
  };

  return (
    <div className={cnStyles()}>
      {/* Content */}
      <div className={cnStyles('content')}>
        <h2>Марка стали</h2>
        <div className={cnStyles('body')}>
          <div className={cnStyles('options-list')}>
            {rows.map((row, rowIdx) => (
              <div className={cnStyles('options-row')} key={rowIdx}>
                {row.map((option, colIdx) => (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleGrade(option)}
                    onKeyDown={(e) => { if (e.key === 'Enter') toggleGrade(option); }}
                    className={cnStyles('option', { selected: localActiveGrades?.includes(option) })}
                    key={colIdx}
                  >
                    {option}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className={cnStyles('diameters')}>
            <h3>Диаметры</h3>
            <ul className={cnStyles('diameters-list')}>
              {diameters.map((d, idx) => (
                <li
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleDiameter(d)}
                  onKeyDown={(e) => { if (e.key === 'Enter') toggleDiameter(d); }}
                  className={cnStyles('diameter', { selected: localSelectedDiameters?.includes(d) })}
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={cnStyles('actions')}>
          <button className={cnStyles('btn')} onClick={handleApply}>Применить</button>
          <button className={cnStyles('btn', { outline: true })} onClick={handleCancel}>Сбросить фильтр</button>
        </div>
      </div>
    </div>
  );
};

export default OptionsPickerModal;