import { useEffect, useState } from 'react';
import { useFetchItemsQuery } from '../../services/priceApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
import block from 'bem-cn';
import './DiameterSelector.scss';
import OptionsIcon from '../../images/react-icons/hi/HiOutlineAdjustments.svg';
import { selectActiveGrades } from '../../features/filter/steelgradeSlice';
import { selectSearchQuery } from '../../features/search/searchSlice';
import { updateSelectedDiameters } from '../../features/filter/diameterSlice';

const cnStyles = block('diameter-selector');

const DiameterSelector = () => {
  const dispatch = useAppDispatch();
  const warehouseId = useAppSelector(selectWarehouseId);
  const selectedGrades = useAppSelector(selectActiveGrades);
  const searchQuery = useAppSelector(selectSearchQuery);

  const [filteredDiameters, setFilteredDiameters] = useState<string[]>([]);
  const [selectedDiameters, setSelectedDiameters] = useState<string[]>([]);

  const { data: items = [] } = useFetchItemsQuery(warehouseId);

  useEffect(() => {
    // Clear filtered diameters when searchQuery changes
    // Clear filtered diameters when no Steel Grades are selected
    if (!searchQuery || selectedGrades.length === 0) {
      setFilteredDiameters([]);
      setSelectedDiameters([]);
    }
  }, [searchQuery, selectedGrades]);

  useEffect(() => {
    if (selectedGrades.length > 0 && searchQuery) {
      const diameters = Array.from(
        new Set(
          items
            .filter((item) => {
              // Extract the grade part (after the first space)
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
      // Remove any selected diameters that are no longer available
      setSelectedDiameters((prev) =>
        prev.filter((size) => diameters.includes(size)),
      );
    } else {
      setFilteredDiameters([]);
      setSelectedDiameters([]);
    }
  }, [selectedGrades, items, searchQuery]);

  // Hanldle chip selection
  const handleChipClick = (size: string) => {
    setSelectedDiameters(
      (prev) =>
        prev.includes(size)
          ? prev.filter((s) => s !== size) // Deselect if already selected
          : [...prev, size], // Add to selected if not already selected
    );
  };

  useEffect(() => {
    dispatch(updateSelectedDiameters(selectedDiameters));
  }, [selectedDiameters, dispatch]);

  const content = (
    <ul className={cnStyles('items')}>
      {filteredDiameters.map((size, index) => (
        <li
          key={index}
          className={cnStyles('item', {
            selected: selectedDiameters.includes(size),
          })}
          onClick={() => handleChipClick(size)}
        >
          {size}
        </li>
      ))}
      {filteredDiameters.length === 0 && (
        <li className={cnStyles('no-items')}>No diameters found</li>
      )}
    </ul>
  );

  return (
    <>
      <div className={cnStyles()}>
        {content}

        <img
          src={OptionsIcon}
          alt="diameter-options"
          className={cnStyles('diameter-options')}
        />
      </div>
    </>
  );
};

export default DiameterSelector;
