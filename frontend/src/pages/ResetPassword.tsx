import { MouseEvent, useState, useEffect } from 'react';
import { MDBInput } from 'mdb-react-ui-kit';
import './ResetPassword.scss';
import block from 'bem-cn';
import { useForm } from '../hooks/useForm';
import { TResetPasswordForm } from '../utils/types';
import { useResetPasswordMutation } from '../services/authApi';
import { useLocation } from 'react-router-dom';

const cnStyles = block('reset-password');

const ResetPassword = () => {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string>('');
  const { values, handleChange } = useForm({
    password: '',
    passwordRepeat: '',
  });

  const [resetPassword] = useResetPasswordMutation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    setToken(token);
  }, [location]);

  useEffect(() => {
    if (
      (values as TResetPasswordForm).password !==
      (values as TResetPasswordForm).passwordRepeat
    ) {
      setErrorText('Пароль не совпадает');
    } else {
      setErrorText('');
    }
  }, [values]);

  const checkButtonDisabled = (): boolean => {
    return (
      (values as TResetPasswordForm).password!.length < 6 ||
      (values as TResetPasswordForm).passwordRepeat!.length < 6 ||
      (values as TResetPasswordForm).password !==
        (values as TResetPasswordForm).passwordRepeat
    );
  };

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if ((values as TResetPasswordForm).password && token) {
      await resetPassword({
        password: (values as TResetPasswordForm).password,
        token: token,
      });
    }
  };

  return (
    <section className={cnStyles()}>
      <h2 className={cnStyles('title')}>Новый пароль</h2>
      <form className={cnStyles('form')}>
        <fieldset className={cnStyles('fieldset')}>
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="text"
              name="password"
              value={(values as TResetPasswordForm).password}
              onChange={handleChange}
              label="Пароль"
              className={cnStyles('form-input')}
            />
          </label>

          <label className={cnStyles('form-field')}>
            <MDBInput
              type="text"
              name="passwordRepeat"
              value={(values as TResetPasswordForm).passwordRepeat}
              onChange={handleChange}
              label="Повторите пароль"
              className={cnStyles('form-input')}
            />
          </label>

          <span className={cnStyles('error-text')}>{errorText}</span>

          <button
            className={cnStyles('form-btn-submit')}
            onClick={handleSubmit}
            type="button"
            disabled={checkButtonDisabled()}
          >
            Сбросить пароль
          </button>
        </fieldset>
      </form>

      {/* <div className={cnStyles('actions')}>
        <p className={cnStyles('text')}>
          Вспомнили пароль?
          <Link to="/auth" className={cnStyles('link-text')}>
            {} Вход
          </Link>
        </p>
      </div> */}
    </section>
  );
};

export default ResetPassword;
