import React, { ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  selectSearchQuery,
  setSearchQuery,
} from '../../features/search/searchSlice';
import './SearchFilter.scss';
import SearchIcon from '../../images/react-icons/hi/HiOutlineSearch.svg';
import ClearIcon from '../../images/react-icons/hi/HiOutlineBackspace.svg';
import block from 'bem-cn';

interface SearchFilterProps {
  placeholder?: string;
}

const cnStyles = block('search-filter');

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
    <div className={cnStyles()}>
      <img
        src={SearchIcon}
        alt="SearchIcon"
        className={cnStyles('icon').mix('search-filter__icon--search')}
      />
      <input
        type="text"
        className="search-filter__input"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
      />
      {searchQuery && (
        <img
          src={ClearIcon}
          alt="ClearIcon"
          className={cnStyles('icon').mix('search-filter__icon--clear')}
          onClick={handleClearInput}
        />
      )}
    </div>
  );
};

export default SearchFilter;
