import { FC } from 'react';
import block from 'bem-cn';
import './ModalOverlay.scss';

const cnStyles = block('overlay');

type IModalOverlayProps = {
  onClick: () => void;
};

export const ModalOverlay: FC<IModalOverlayProps> = ({ onClick }) => {
  return (
    <div className={cnStyles()} onClick={onClick}></div>
  )
}