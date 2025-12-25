import { useState, useEffect, FC } from 'react';
import { useFetchItemsQuery } from '../../services/priceApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
import block from 'bem-cn';
import './SteelGrades.scss';
import { selectSearchQuery } from '../../features/search/searchSlice';
import { updateActiveGrades, updateAllGrades, selectActiveGrades } from '../../features/filter/steelgradeSlice';
import OptionsPicker from '../OptionsPicker/OptionsPicker';

const cnStyles = block('steel-grades');

const SteelGrades: FC = () => {
  const dispatch = useAppDispatch();
  const warehouseId = useAppSelector(selectWarehouseId);
  const searchQuery = useAppSelector(selectSearchQuery);
  const activeGradesFromStore = useAppSelector(selectActiveGrades);

  const [selectedGrades, setSelectedGrades] = useState<string[]>(activeGradesFromStore || []);

  const { data: items = [] } = useFetchItemsQuery(warehouseId);

  const getUniqueNamesByPrefix = (
    items: { name: string }[],
    prefix: string,
  ): string[] => {
    const uniqueNames = new Set<string>();

    items.forEach((item) => {
      if (item.name.toLowerCase().startsWith(prefix)) {
        const [, ...rest] = item.name.split(' '); // Split the name and ignore the first word
        const nameWithoutPrefix = rest.join(' ').trim(); // Join the remaining words and trim whitespace
        if (nameWithoutPrefix) {
          uniqueNames.add(nameWithoutPrefix); // Add the modified name to the Set
        }
      }
    });

    return Array.from(uniqueNames); // Convert the Set back to an array
  };

  // Filter unique names based on the searchQuery
  const uniqueNames = getUniqueNamesByPrefix(items, searchQuery);

  // Handle chip selection
  const handleChipClick = (grade: string) => {
    setSelectedGrades(
      (prevSelected) =>
        prevSelected.includes(grade)
          ? prevSelected.filter((g) => g !== grade) // Deselect if already selected
          : [...prevSelected, grade], // Add to selected if not already selected
    );
  };

  // Сохранять все уникальные марки стали в сторе при загрузке/фильтрации
  useEffect(() => {
    dispatch(updateAllGrades(uniqueNames));
  }, [uniqueNames, dispatch]);

  // Sync local state with Redux store when it changes (e.g., from OptionsPickerModal)
  useEffect(() => {
    setSelectedGrades(activeGradesFromStore);
  }, [activeGradesFromStore]);

  // Dispatch updated grades to Redux when selectedGrades changes
  useEffect(() => {
    dispatch(updateActiveGrades(selectedGrades));
  }, [selectedGrades, dispatch]);

  const content = (
    <ul className={cnStyles('items')}>
      {uniqueNames.map((name, index) => (
        <li
          key={index}
          className={cnStyles('item', {
            selected: selectedGrades.includes(name),
          })}
          // className='steel-grades__item steel-grades__item--selected'
          onClick={() => handleChipClick(name)}
        >
          <span>{name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div className={cnStyles()}>
        {content}
        <OptionsPicker options={uniqueNames} onChange={() => {}} />
      </div>
    </>
  );
};

export default SteelGrades;
