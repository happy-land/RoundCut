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

const OptionsPicker: React.FC<OptionsPickerProps> = ({
  options,
  selectedOption,
  onChange,
}) => {
  return (
    <Link
      to={{
        pathname: '/select-options',
      }}
      state={{ backgroundLocation: true }}
      className={cnStyles()}
    >
      {/* {warehouse && <div>{warehouse.name}</div>} */}
      <img src={OptionsIcon} alt="OptionsIcon" className={cnStyles('')} />
    </Link>
  );
};

export default OptionsPicker;