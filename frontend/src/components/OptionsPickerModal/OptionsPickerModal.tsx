import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAvailableGrades, selectActiveGrades, updateActiveGrades } from '../../features/filter/steelgradeSlice';
import { selectDiameter, updateSelectedDiameters } from '../../features/filter/diameterSlice';
import { useFetchItemsQuery } from '../../services/priceApi';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
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
    const filtered = items.filter((item: any) => {
      const [, ...rest] = item.name.split(' ');
      const grade = rest.join(' ').trim();
      if (activeGrades && activeGrades.length > 0) {
        return activeGrades.includes(grade);
      }
      return true;
    });

    const set = new Set<string>();
    filtered.forEach((item: any) => {
      const dia = item.size.replace(/мм\.?/g, '').trim();
      if (dia) set.add(dia);
    });

    // sort numerically when possible
    return Array.from(set).sort((a, b) => {
      const na = parseFloat(a.match(/^\d+/)?.[0] || '0');
      const nb = parseFloat(b.match(/^\d+/)?.[0] || '0');
      return na - nb;
    });
  };

  const diameters = computeDiameters();

  const toggleGrade = (grade: string) => {
    const next = activeGrades && activeGrades.includes(grade)
      ? activeGrades.filter((g) => g !== grade)
      : [...(activeGrades || []), grade];
    dispatch(updateActiveGrades(next));
  };

  const toggleDiameter = (size: string) => {
    const next = selectedDiameters && selectedDiameters.includes(size)
      ? selectedDiameters.filter((s) => s !== size)
      : [...(selectedDiameters || []), size];
    dispatch(updateSelectedDiameters(next));
  };

  return (
    <div className={cnStyles()}>
      {/* Close Modal Icon */}
      <button
        className={cnStyles('close')}
        onClick={handleCloseModal}
        aria-label="Close Modal"
      >
        ✖
      </button>

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
                    className={cnStyles('option', { selected: activeGrades?.includes(option) })}
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
                  className={cnStyles('diameter', { selected: selectedDiameters?.includes(d) })}
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPickerModal;