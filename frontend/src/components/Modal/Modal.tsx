import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import block from 'bem-cn';
import './Modal.scss'
import { ModalOverlay } from '../ModalOverlay/ModalOverlay';

interface IModalProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const cnStyles = block('modal');

const modalsContainer = document.querySelector('#modals') as HTMLElement;

export const Modal: FC<IModalProps> = ({ title, onClose, children }) => {
  useEffect(() => {
    const handleEscKeydown = (event: KeyboardEvent): void => {
      event.key === 'Escape' && onClose();
    };
    document.addEventListener('keydown', (event) => handleEscKeydown(event));

    return () => {
      document.removeEventListener('keydown', (event) =>
        handleEscKeydown(event),
      );
    };
  }, [onClose]);

  return createPortal(
    <>
      {/* Close Modal Icon */}
      <button
        className={cnStyles('close')}
        onClick={onClose}
        aria-label="Close Modal"
      >
        ✖
      </button>

      <div className={cnStyles('container')}>
        <div className={cnStyles('header')}>
          <h3 className={cnStyles('title')}>{title}</h3>
        </div>
        <div className={cnStyles('content')}>{children}</div>
      </div>
      <ModalOverlay onClick={onClose} />
    </>,
    modalsContainer,
  );
};
