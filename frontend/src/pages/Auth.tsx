import { MouseEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MDBInput } from 'mdb-react-ui-kit';
import {
  useRegisterUserMutation,
  useFetchTokenMutation,
  // useFetchUserMutation,
} from '../services/authApi';
import { toast } from 'react-toastify';
import { setCookie } from '../utils/cookie';
// import { useAppDispatch } from '../app/hooks';
// import { setUser } from '../features/authSlice';
import './Auth.scss';
import block from 'bem-cn';
import { useForm } from '../hooks/useForm';
import { TLoginForm } from '../utils/types';

const cnStyles = block('auth');

const Auth = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [errorText, setErrorText] = useState<string>('');

  const { values, handleChange } = useForm({
    email: '',
    password: '',
  });

  // const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [registerUser] = useRegisterUserMutation();

  const [fetchToken] = useFetchTokenMutation();

  // const [fetchUser, { data: userData, isSuccess: isUserSuccess }] =
  //   useFetchUserMutation();

  // проверим, если ли токен в куках,
  // если есть - то перейдем на /dashboard
  //   useEffect(() => {
  //     if (getCookie('accessToken')) {
  //       navigate('/dashboard')
  // ;    }
  //   });

  const handleLogin = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (
      'password' in values &&
      (values as TLoginForm).email &&
      values.password
    ) {
      await fetchToken({
        username: (values as TLoginForm).email,
        password: values.password,
      })
        .then((response) => {
          if ('data' in response) {
            console.log(response.data);
            setCookie('accessToken', response.data.access_token, { expires: 7 * 24 * 3600 });

            // получеие данных о пользователе и сохранение их в сторе - сделаем на странице /dashboard
            // const user = await fetchUser({});
            // if (user) {
            //   toast.success('вход выполнен!', userData);
            //   dispatch(
            //     setUser({ user: user.data, token: res.data.access_token }),
            //   );
            navigate('/dashboard');
          }
          if ('error' in response) {
            console.log(response.error);
            if ('data' in response.error) {
              setErrorText(
                (response.error.data as { message: string }).message,
              );
            } else {
              setErrorText('An unknown error occurred');
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toast.error('Please fill all inputs');
    }
  };

  const handleRegister = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (
      'password' in values &&
      (values as TLoginForm).email &&
      values.password
    ) {
      await registerUser({
        email: (values as TLoginForm).email,
        password: values.password,
      })
        .then((response) => {
          if ('data' in response) {
            console.log(response.data);
            fetchToken({
              username: (values as TLoginForm).email,
              password: values.password,
            }).then((response) => {
              if ('data' in response) {
                setCookie('accessToken', response.data.access_token, { expires: 7 * 24 * 3600 });
                navigate('/dashboard');
              }
            });
          }
          if ('error' in response) {
            if ('data' in response.error) {
              setErrorText(
                (response.error.data as { message: string }).message,
              );
            } else {
              setErrorText('An unknown error occurred');
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const toggleForm = () => {
    setShowRegister((prev) => !prev);
    setErrorText('');
  };

  const checkButtonDisabled = (): boolean => {
    return (
      (values as TLoginForm).email.length < 6 ||
      (values as TLoginForm).password.length < 4
    );
  };

  return (
    <section className={cnStyles()}>
      <h2 className={cnStyles('title')}>
        {!showRegister ? 'Вход' : 'Регистрация'}
      </h2>
      <form className={cnStyles('form')}>
        <fieldset className={cnStyles('fieldset')}>
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="text"
              name="email"
              value={(values as TLoginForm).email}
              onChange={handleChange}
              label="Эл. почта"
              className={cnStyles('form-input')}
            />
          </label>
          {!showRegister && (
            <div className={cnStyles('link-wrapper')}>
              <Link
                to="/forgot-password"
                className={cnStyles('forgot-password')}
              >
                Забыли пароль?
              </Link>
            </div>
          )}
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="password"
              name="password"
              value={(values as TLoginForm).password}
              onChange={handleChange}
              label="Пароль"
              className={cnStyles('form-input')}
            />
          </label>
          <span className={cnStyles('error-text')}>{errorText}</span>
          {!showRegister ? (
            <button
              className={cnStyles('form-btn-submit')}
              onClick={handleLogin}
              type="button"
              disabled={checkButtonDisabled()}
            >
              Войти
            </button>
          ) : (
            <button
              className={cnStyles('form-btn-submit').mix(
                'auth__form-btn-outline',
              )}
              onClick={handleRegister}
              type="button"
              disabled={checkButtonDisabled()}
            >
              Новый пользователь
            </button>
          )}
        </fieldset>
      </form>

      <div className={cnStyles('actions')}>
        {!showRegister ? (
          <p className={cnStyles('text')}>
            Нет аккаунта?
            <span className={cnStyles('link-text')} onClick={toggleForm}>
              {} Регистрация
            </span>
          </p>
        ) : (
          <p className={cnStyles('text')}>
            Есть аккаунт?
            <span className={cnStyles('link-text')} onClick={toggleForm}>
              {} Вход
            </span>
          </p>
        )}
      </div>
    </section>
  );
};

export default Auth;
