import { FC } from 'react';
import './ModalOverlay.scss';
import block from 'bem-cn';

type IModalOverlayProps = {
  onClick: () => void;
};

const cnStyles = block('overlay');

export const ModalOverlay: FC<IModalOverlayProps> = ({ onClick }) => {
  return (
    <div className={cnStyles()} onClick={onClick}></div>
  )
}
