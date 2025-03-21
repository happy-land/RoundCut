import { MouseEvent, useState } from 'react';
import { MDBInput } from 'mdb-react-ui-kit';
import { useSendResetPasswordLinkByEmailMutation } from '../services/authApi';
import './ForgotPassword.scss';
import block from 'bem-cn';
import { useForm } from '../hooks/useForm';
import { Link } from 'react-router-dom';
import { TForgotPasswordForm } from '../utils/types';

const cnStyles = block('forgot-password');

type TButtonText = 'Восстановить' | 'Письмо отправлено';

const ForgotPassword = () => {
  const [errorText, setErrorText] = useState<string>('');
  const [linkSent, setLinkSent] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<TButtonText>('Восстановить');

  const { values, handleChange } = useForm({
    email: 'ruslan.s.kulish@gmail.com',
  });

  const [sendResetPasswordLinkByEmail] =
    useSendResetPasswordLinkByEmailMutation();

  const checkButtonDisabled = (): boolean => {
    return (values as TForgotPasswordForm).email!.length < 6 || linkSent;
  };

  const handleSubmitEmail = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if ((values as TForgotPasswordForm).email) {
      await sendResetPasswordLinkByEmail({
        email: (values as TForgotPasswordForm).email,
      })
        .then((response) => {
          if ('data' in response) {
            setLinkSent(true);
            setButtonText('Письмо отправлено');
            console.log(response.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <section className={cnStyles()}>
      <h2 className={cnStyles('title')}>Сбросить пароль</h2>
      <form className={cnStyles('form')}>
        <fieldset className={cnStyles('fieldset')}>
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="text"
              name="email"
              value={(values as TForgotPasswordForm).email}
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
            {buttonText}
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
