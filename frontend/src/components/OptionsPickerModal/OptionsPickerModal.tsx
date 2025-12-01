import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectAvailableGrades } from '../../features/filter/steelgradeSlice';
import block from 'bem-cn';
import './OptionsPickerModal.scss';

const cnStyles = block('options-picker');

const OptionsPickerModal: React.FC = () => {
  const navigate = useNavigate();
  const options: string[] = useAppSelector(selectAvailableGrades);
  console.log('Options in modal:', options);

  const handleCloseModal = () => {
    navigate(-1); // Close modal when the close icon is clicked
  };

  // Разбить массив на строки по 3 элемента
  const rows = [];
  for (let i = 0; i < options.length; i += 3) {
    rows.push(options.slice(i, i + 3));
  }

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
        <h2>Options Picker</h2>
        <div className={cnStyles('options-list')}>
          {rows.map((row, rowIdx) => (
            <div className={cnStyles('options-row')} key={rowIdx}>
              {row.map((option, colIdx) => (
                <div className={cnStyles('option')} key={colIdx}>
                  {option}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptionsPickerModal;