import React, { ChangeEvent } from 'react';
import './SearchFilter.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSearchQuery, setSearchQuery } from '../../features/search/searchSlice';

interface SearchFilterProps {
  placeholder?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ placeholder }) => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(event.target.value));
  };

  const handleClearInput = () => {
    dispatch(setSearchQuery(''));
  };

  return (
    <div className="search-filter">
      <div className="search-filter__icon search-filter__icon--search">🔍</div>
      <input
        type="text"
        className="search-filter__input"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
      />
      {searchQuery && (
        <span
          className="search-filter__icon search-filter__icon--clear"
          onClick={handleClearInput}
        >
          ✖
        </span>
      )}
    </div>
  );
};

export default SearchFilter;