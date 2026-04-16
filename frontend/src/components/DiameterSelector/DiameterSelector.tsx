import { useEffect, useState } from 'react';
import { useFetchItemsQuery } from '../../services/priceApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
import block from 'bem-cn';
import './DiameterSelector.scss';
import { selectActiveGrades } from '../../features/filter/steelgradeSlice';
import { selectSearchQuery } from '../../features/search/searchSlice';
import { updateSelectedDiameters, selectDiameter } from '../../features/filter/diameterSlice';

const cnStyles = block('diameter-selector');

const DiameterSelector = () => {
  const dispatch = useAppDispatch();
  const warehouseId = useAppSelector(selectWarehouseId);
  const selectedGrades = useAppSelector(selectActiveGrades);
  const searchQuery = useAppSelector(selectSearchQuery);
  const selectedDiametersFromStore = useAppSelector(selectDiameter);

  const [filteredDiameters, setFilteredDiameters] = useState<string[]>([]);
  const [selectedDiameters, setSelectedDiameters] = useState<string[]>(selectedDiametersFromStore || []);

  const { data: items = [] } = useFetchItemsQuery(warehouseId);

  useEffect(() => {
    if (!searchQuery || selectedGrades.length === 0) {
      setFilteredDiameters([]);
      setSelectedDiameters([]);
    }
  }, [searchQuery, selectedGrades]);

  useEffect(() => {
    setSelectedDiameters(selectedDiametersFromStore || []);
  }, [selectedDiametersFromStore]);

  useEffect(() => {
    if (selectedGrades.length > 0 && searchQuery) {
      const diameters = Array.from(
        new Set(
          items
            .filter((item) => {
              const [, ...rest] = item.name.split(' ');
              const grade = rest.join(' ').trim();
              return (
                item.name.toLowerCase().startsWith(searchQuery.toLowerCase()) &&
                selectedGrades.includes(grade)
              );
            })
            .map((item) => item.size.replace(/мм\.?/g, '').trim()),
        ),
      ).sort((a, b) => {
        const numA = parseFloat(a.match(/^\d+/)?.[0] || '0');
        const numB = parseFloat(b.match(/^\d+/)?.[0] || '0');
        return numA - numB;
      });

      setFilteredDiameters(diameters);
      setSelectedDiameters((prev) => prev.filter((size) => diameters.includes(size)));
    } else {
      setFilteredDiameters([]);
      setSelectedDiameters([]);
    }
  }, [selectedGrades, items, searchQuery]);

  const handleChipClick = (size: string) => {
    setSelectedDiameters((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const handleClearAll = () => setSelectedDiameters([]);

  useEffect(() => {
    dispatch(updateSelectedDiameters(selectedDiameters));
  }, [selectedDiameters, dispatch]);

  if (filteredDiameters.length === 0) return null;

  return (
    <div className={cnStyles()}>
      <div className={cnStyles('header')}>
        <span className={cnStyles('label')}>
          Диаметр
          {selectedDiameters.length > 0 && (
            <span className={cnStyles('count')}>{selectedDiameters.length}</span>
          )}
        </span>
        {selectedDiameters.length > 0 && (
          <button className={cnStyles('clear-btn')} onClick={handleClearAll}>
            Сбросить
          </button>
        )}
      </div>
      <ul className={cnStyles('items')}>
        {filteredDiameters.map((size, index) => (
          <li
            key={index}
            className={cnStyles('item', { selected: selectedDiameters.includes(size) })}
            onClick={() => handleChipClick(size)}
          >
            {size}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DiameterSelector;
