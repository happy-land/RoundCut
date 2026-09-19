import React from 'react';
import './CustomCheckbox.scss';

export type CheckboxState = 'unchecked' | 'checked' | 'disabled' | 'hover';

interface CustomCheckboxProps {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  state?: CheckboxState;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  checked = false,
  disabled = false,
  onChange,
  state,
}) => {
  // For demo: allow force state for storybook/testing
  const [isHovered, setIsHovered] = React.useState(false);
  const isChecked = state ? state === 'checked' : checked;
  const isDisabled = state ? state === 'disabled' : disabled;
  const isHover = state ? state === 'hover' : isHovered;

  return (
    <label
      className={`custom-checkbox${isChecked ? ' checked' : ''}${isDisabled ? ' disabled' : ''}${isHover ? ' hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type="checkbox"
        checked={isChecked}
        disabled={isDisabled}
        onChange={e => onChange?.(e.target.checked)}
        tabIndex={isDisabled ? -1 : 0}
      />
      <span className="checkbox-box">
        {isChecked && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8.5L7 11.5L12 5.5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="checkbox-label">{label}</span>
    </label>
  );
};

export default CustomCheckbox;
