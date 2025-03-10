import { ChangeEvent, MouseEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MDBInput } from 'mdb-react-ui-kit';
import {
  useRegisterUserMutation,
  useFetchTokenMutation,
  useFetchUserMutation,
} from '../services/authApi';
import { toast } from 'react-toastify';
import { setCookie } from '../utils/cookie';
import { useAppDispatch } from '../app/hooks';
import { setUser } from '../features/authSlice';
import './Auth.scss';
import block from 'bem-cn';

const cnStyles = block('auth');

const initialState = {
  username: '',
  email: '',
  password: '',
};

const Auth = () => {
  const [formValue, setFormValue] = useState(initialState);

  const { username, email, password } = formValue;
  const [showRegister, setShowRegister] = useState(false);
  const [errorText, setErrorText] = useState<string>("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [registerUser] = useRegisterUserMutation();

  const [fetchToken] = useFetchTokenMutation();

  const [fetchUser, { data: userData, isSuccess: isUserSuccess }] =
    useFetchUserMutation();

  // переделали useFetchTokenQuery -> useFetchTokenMutation
  // const {
  //   data: userDataResponse,
  //   isLoading: isUserLoading,
  //   isSuccess: isUserSuccess,
  // } = useFetchUserQuery('', { skip });

  // проверим, если ли токен в куках,
  // если есть - то перейдем на /dashboard
  //   useEffect(() => {
  //     if (getCookie('accessToken')) {
  //       navigate('/dashboard')
  // ;    }
  //   });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValue({ ...formValue, [event.target.name]: event.target.value });
  };

  const handleLogin = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (username && password) {
      const res = await fetchToken({ username, password });
      console.log(res.error.status);
      if (res.error.status === 401) {
        setErrorText(res.error.data.message);
      }
      setCookie('accessToken', res.data.access_token);
      if (res.data.access_token) {
        console.log('token ok');
        const user = await fetchUser({});
        console.log(user);
        if (user) {
          toast.success('вход выполнен!', userData);
          dispatch(setUser({ user: user.data, token: res.data.access_token }));
          navigate('/dashboard');
        } else {
          console.log('user data loading error');
        }
      } else {
        console.log('token error');
      }
    } else {
      toast.error('Please fill all inputs');
    }
  };

  const handleRegister = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (username && password && email) {
      const res = await registerUser({ email, username, password });
      console.log(res);
    }
  };

  return (
    <section className={cnStyles()}>
      <h2 className={cnStyles('title')}>
        {!showRegister ? 'Вход' : 'Register'}
      </h2>
      <form className={cnStyles('form')}>
        <fieldset className={cnStyles('fieldset')}>
          {showRegister && (
            <MDBInput
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              label="Email"
              className="form-control form-control-lg"
            />
          )}
          <label className={cnStyles('form-field')}>
            <MDBInput
              type="text"
              name="username"
              value={username}
              onChange={handleChange}
              label="Имя пользователя"
              className={cnStyles('form-input')}
            />
          </label>
          <div className={cnStyles('link-wrapper')}>
            <Link to="/forgot-password" className={cnStyles('forgot-password')}>
              Забыли пароль?
            </Link>
          </div>

          <label className={cnStyles('form-field')}>
            <MDBInput
              type="password"
              name="password"
              value={password}
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
            >
              Войти
            </button>
          ) : (
            <button onClick={handleRegister} type="button">
              Register
            </button>
          )}
        </fieldset>
      </form>

      <div className={cnStyles('actions')}>
        {!showRegister ? (
          <p className={cnStyles('text')}>
            Нет аккаунта?
            <Link
              to="/register"
              className={cnStyles('link-text')}
              onClick={() => setShowRegister(true)}
            >
              {} Регистрация
            </Link>
          </p>
        ) : (
          <>
            Already have an account?
            <p
              style={{ cursor: 'pointer' }}
              onClick={() => setShowRegister(false)}
            >
              Sign in
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default Auth;
