import { FC, FormEvent, ChangeEvent, useState, useCallback } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import block from 'bem-cn';
import { useAppSelector } from '../../app/hooks';
import { useFetchTokenMutation } from '../../services/authApi';
import { selectAuth } from '../../features/authSlice';
import './SigninForm.scss';

const cnStyles = block('signin-form');

type TSigninCallback = (evt: FormEvent<HTMLFormElement>) => void;

export const SigninForm: FC = () => {
  const [login] = useFetchTokenMutation();
  const { user } = useAppSelector(selectAuth);
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value, name } = event.target;
    setValues({ ...values, [name]: value });
  };

  const signin = useCallback<TSigninCallback>(
    (evt) => {
      evt.preventDefault();
      login({ email: values.email, password: values.password });
    },
    [values.email, values.password, login],
  );

  if (user) {
    return (
      <Navigate
        to={location.state?.from || '/dashboard'}
      />
    );
  }

  return (
    <form className={cnStyles()} onSubmit={signin}>
      <label htmlFor="email" className={cnStyles('label')}>
        <p className={cnStyles('label-title')}>Email</p>
      </label>
      <input
        className={cnStyles('input')}
        type="email"
        name="email"
        placeholder="Email"
        id="email"
        value={values.email}
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
        value={values.password}
        onChange={handleChange}
      />

      <input className={cnStyles('submit-btn')} type="submit" value="Войти" />
    </form>
  );
};
