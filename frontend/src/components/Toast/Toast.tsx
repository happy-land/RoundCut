import { FC, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import block from 'bem-cn';
import './Toast.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { hideToast, selectToast } from '../../features/toast/toastSlice';

const cn = block('toast');

const DURATION = 2500;

const Toast: FC = () => {
  const dispatch = useAppDispatch();
  const { message, type } = useAppSelector(selectToast);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!message) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch(hideToast());
    }, DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, dispatch]);

  const portalTarget = document.getElementById('modals') ?? document.body;

  if (!message) return null;

  return createPortal(
    <div className={cn({ [type]: true })} role="status" aria-live="polite">
      <span className={cn('icon')}>
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'info' && 'i'}
      </span>
      <span className={cn('message')}>{message}</span>
    </div>,
    portalTarget,
  );
};

export default Toast;
