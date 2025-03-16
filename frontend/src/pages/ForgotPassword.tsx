import { MouseEvent, useState } from 'react';
import { MDBInput } from 'mdb-react-ui-kit';
import { useFetchResetPasswordTokenMutation } from '../services/authApi';
import './ForgotPassword.scss';
import block from 'bem-cn';
import { useForm } from '../hooks/useForm';
import { Link } from 'react-router-dom';

const cnStyles = block('forgot-password');

const ForgotPassword = () => {
  const [errorText, setErrorText] = useState<string>('');

  const { values, handleChange } = useForm({
    email: 'ruslan.s.kulish@gmail.com',
  });

  const [fetchResetPasswordToken] = useFetchResetPasswordTokenMutation();

  const checkButtonDisabled = (): boolean => {
    return values.email!.length < 6;
  };

  const handleSubmitEmail = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (values.email) {
      await fetchResetPasswordToken({ email: values.email })
        .then((response) => {
          console.log(response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <section className={cnStyles()}>
      <h2 className={cnStyles('title')}>Восстановить пароль</h2>
      <form className={cnStyles('form')}>
        <fieldset className={cnStyles('fieldset')}>
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="text"
              name="email"
              value={values.email}
              onChange={handleChange}
              label="Эл. почта"
              className={cnStyles('form-input')}
            />
          </label>

          <span className={cnStyles('error-text')}>{errorText}</span>

          <button
            className={cnStyles('form-btn-submit')}
            onClick={handleSubmitEmail}
            type="button"
            disabled={checkButtonDisabled()}
          >
            Восстановить
          </button>
        </fieldset>
      </form>

      <div className={cnStyles('actions')}>
        <p className={cnStyles('text')}>
          Вспомнили пароль?
          <Link to="/auth" className={cnStyles('link-text')}>
            {} Вход
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;
