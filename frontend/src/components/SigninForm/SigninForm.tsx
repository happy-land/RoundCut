import { FC, useEffect, FormEvent, useCallback } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import block from 'bem-cn';
import { useForm } from '../../hooks/useForm';
import { useDispatch, useSelector } from '../../hooks';
import { authUserThunk, getUserDataThunk } from '../../services/actions/user';
import './SigninForm.scss';

const cnStyles = block('signin-form');

type TSigninCallback = (evt: FormEvent<HTMLFormElement>) => void;

export const SigninForm: FC = () => {
  const dispatch = useDispatch();
  const { isAuth } = useSelector((store) => store.user);

  const location = useLocation();

  const { values, handleChange } = useForm({
    username: '',
    password: '',
  });

  const signin = useCallback<TSigninCallback>(
    (evt) => {
      evt.preventDefault();
      console.log('values ', values);
      dispatch(authUserThunk(values));
    },
    [values, dispatch],
  );

  useEffect(() => {
    if (isAuth) {
      dispatch(getUserDataThunk());
    }
  }, [isAuth, dispatch]);

  if (isAuth) {
    return (
      <Navigate
        // // Если объект state не является undefined, вернём пользователя назад.
        to={location.state?.from || '/'}
      />
    );
  }

  return (
    <form className={cnStyles()} onSubmit={signin}>
      <label htmlFor="username" className={cnStyles('label')}>
        <p className={cnStyles('label-title')}>Имя пользователя</p>
      </label>
      <input
        className={cnStyles('input')}
        type="text"
        name="username"
        placeholder="Имя пользователя"
        id="username"
        onChange={handleChange}
      />

      <label htmlFor="password" className={cnStyles('label')}>
        <p className={cnStyles('label-title')}>Пароль</p>
      </label>
      <input
        className={cnStyles('input').mix(['signin-form__input-password'])}
        type="password"
        name="password"
        placeholder="Пароль"
        id="password"
        onChange={handleChange}
      />

      <input className={cnStyles('submit-btn')} type="submit" value="Войти" />
    </form>
  );
};
