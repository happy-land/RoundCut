import React from 'react';
import block from 'bem-cn';
import { Link } from 'react-router-dom';
import OptionsIcon from '../../images/react-icons/hi/HiOutlineAdjustments.svg';
import './OptionsPicker.scss';

interface OptionsPickerProps {
  options?: string[];
  selectedOption?: string;
  onChange: (option: string) => void;
}

const cnStyles = block('options-picker');

const OptionsPicker: React.FC<OptionsPickerProps> = () => {
  return (
    <Link
      to={{
        pathname: '/select-options',
      }}
      state={{ backgroundLocation: true }}
      className={cnStyles()}
    >
      <img src={OptionsIcon} alt="OptionsIcon" className={cnStyles('icon')} />
    </Link>
  );
};

export default OptionsPicker;