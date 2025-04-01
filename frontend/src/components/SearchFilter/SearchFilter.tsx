import React from 'react';
import './SearchFilter.scss';

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ searchQuery, setSearchQuery }) => {
  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="search-filter">
      <div className="search-filter__icon search-filter__icon--search">🔍</div>
      <input
        type="text"
        className="search-filter__input"
        placeholder="Search warehouses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <div
          className="search-filter__icon search-filter__icon--clear"
          onClick={handleClear}
        >
          ✖
        </div>
      )}
    </div>
  );
};

export default SearchFilter;