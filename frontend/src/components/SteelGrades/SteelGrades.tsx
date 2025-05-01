import React from 'react';
import { useFetchItemsQuery } from '../../services/priceApi';
import { useAppSelector } from '../../app/hooks';
import { selectWarehouseId } from '../../features/warehouse/warehouseSlice';
import block from 'bem-cn';
import './SteelGrades.scss';
import { selectSearchQuery } from '../../features/search/searchSlice';

const cnStyles = block('steel-grades');

const SteelGrades = () => {
  const warehouseId = useAppSelector(selectWarehouseId);
  const searchQuery = useAppSelector(selectSearchQuery);

  const { data: items = [], refetch } = useFetchItemsQuery(warehouseId);

  const getUniqueNamesByPrefix = (items: { name: string }[], prefix: string): string[] => {
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

  const content = (
    <>
    <ul className={cnStyles()}>
      {uniqueNames.map((name, index) => (
        <li key={index}>
          <span className={cnStyles('item')}>{name}</span>
        </li>
      ))}
    </ul>
    </>
    
  );

  // const content = (
  //   <ul>
  //     {items.map((item) => (
  //       <li key={item.id}>
  //         <span>{item.name}</span>
  //       </li>
  //     ))}
  //   </ul>
  // );

  return <div>{content}</div>;
};

export default SteelGrades;
