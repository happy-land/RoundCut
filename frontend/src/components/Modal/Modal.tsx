import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import block from 'bem-cn';
import './Modal.scss';

const cnStyles = block('modal');

interface IModalProps {
  title?: string;
  onClose: () => void;
}

const modalsContainer = document.querySelector('#modals') as HTMLElement;

export const Modal: FC<IModalProps> = ({ title, onClose, children }) => {
  return createPortal(
    <>
      <div className={cnStyles()}>
        <h1 className={cnStyles('title')}>{title}</h1>
        {children}
      </div>
      
    </>,
    modalsContainer,
  );
};
