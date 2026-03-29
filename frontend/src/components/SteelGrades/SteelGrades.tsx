import { useState, useEffect, FC } from 'react';
import { useFetchItemsQuery } from '../../services/priceApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
import block from 'bem-cn';
import './SteelGrades.scss';
import { selectSearchQuery } from '../../features/search/searchSlice';
import { updateActiveGrades, updateAllGrades, selectActiveGrades } from '../../features/filter/steelgradeSlice';

const cnStyles = block('steel-grades');

const COLLAPSED_LIMIT = 8;

const SteelGrades: FC = () => {
  const dispatch = useAppDispatch();
  const warehouseId = useAppSelector(selectWarehouseId);
  const searchQuery = useAppSelector(selectSearchQuery);
  const activeGradesFromStore = useAppSelector(selectActiveGrades);

  const [selectedGrades, setSelectedGrades] = useState<string[]>(activeGradesFromStore || []);
  const [expanded, setExpanded] = useState(false);

  const { data: items = [] } = useFetchItemsQuery(warehouseId);

  const getUniqueNamesByPrefix = (
    items: { name: string }[],
    prefix: string,
  ): string[] => {
    const uniqueNames = new Set<string>();
    items.forEach((item) => {
      if (item.name.toLowerCase().startsWith(prefix)) {
        const [, ...rest] = item.name.split(' ');
        const nameWithoutPrefix = rest.join(' ').trim();
        if (nameWithoutPrefix) {
          uniqueNames.add(nameWithoutPrefix);
        }
      }
    });
    return Array.from(uniqueNames);
  };

  const uniqueNames = getUniqueNamesByPrefix(items, searchQuery.toLowerCase());
  const hiddenCount = Math.max(0, uniqueNames.length - COLLAPSED_LIMIT);
  const visibleNames = expanded ? uniqueNames : uniqueNames.slice(0, COLLAPSED_LIMIT);

  const handleChipClick = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade],
    );
  };

  const handleClearAll = () => setSelectedGrades([]);

  useEffect(() => {
    dispatch(updateAllGrades(uniqueNames));
  }, [uniqueNames.join(','), dispatch]);

  useEffect(() => {
    setSelectedGrades(activeGradesFromStore);
  }, [activeGradesFromStore]);

  useEffect(() => {
    dispatch(updateActiveGrades(selectedGrades));
  }, [selectedGrades, dispatch]);

  useEffect(() => {
    setExpanded(false);
  }, [warehouseId, searchQuery]);

  if (uniqueNames.length === 0) return null;

  return (
    <div className={cnStyles()}>
      <div className={cnStyles('header')}>
        <span className={cnStyles('label')}>
          Марка стали
          {selectedGrades.length > 0 && (
            <span className={cnStyles('count')}>{selectedGrades.length}</span>
          )}
        </span>
        {selectedGrades.length > 0 && (
          <button className={cnStyles('clear-btn')} onClick={handleClearAll}>
            Сбросить
          </button>
        )}
      </div>
      <ul className={cnStyles('items', { expanded })}>
        {visibleNames.map((name, index) => (
          <li
            key={index}
            className={cnStyles('item', { selected: selectedGrades.includes(name) })}
            onClick={() => handleChipClick(name)}
          >
            {name}
          </li>
        ))}
        {!expanded && hiddenCount > 0 && (
          <li className={cnStyles('more-btn')} onClick={() => setExpanded(true)}>
            Ещё {hiddenCount} →
          </li>
        )}
        {expanded && hiddenCount > 0 && (
          <li className={cnStyles('more-btn', 'collapse')} onClick={() => setExpanded(false)}>
            Свернуть ↑
          </li>
        )}
      </ul>
    </div>
  );
};

export default SteelGrades;
