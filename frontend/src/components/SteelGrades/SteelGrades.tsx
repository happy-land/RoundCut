import React, { useState, useEffect } from 'react';
import { useFetchItemsQuery } from '../../services/priceApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
import block from 'bem-cn';
import './SteelGrades.scss';
import { selectSearchQuery } from '../../features/search/searchSlice';
import OptionsIcon from '../../images/react-icons/hi/HiOutlineAdjustments.svg';
import { updateSelectedGrades } from '../../features/filter/steelgradeSlice';

const cnStyles = block('steel-grades');

const SteelGrades = () => {
  const dispatch = useAppDispatch();
  const warehouseId = useAppSelector(selectWarehouseId);
  const searchQuery = useAppSelector(selectSearchQuery);

  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

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

  // Dispatch updated grades to Redux when selectedGrades changes
  useEffect(() => {
    dispatch(updateSelectedGrades(selectedGrades));
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

        <img
          src={OptionsIcon}
          alt="steelgrade-options"
          className={cnStyles('steelgrade-options')}
        />
      </div>
    </>
  );
};

export default SteelGrades;
