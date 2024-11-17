import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDBInput } from 'mdb-react-ui-kit';
import {
  useRegisterUserMutation,
  useFetchTokenMutation,
  useFetchUserMutation /*, useLazyFetchUserQuery*/,
} from '../services/authApi';
import { toast } from 'react-toastify';
import { setCookie } from '../utils/cookie';
import { useAppDispatch } from '../app/hooks';
import { setUser } from '../features/authSlice';

const initialState = {
  username: '',
  email: '',
  password: '',
};

const Auth = () => {
  const [formValue, setFormValue] = useState(initialState);
  const [skip, setSkip] = useState(true);

  const { username, email, password } = formValue;
  const [showRegister, setShowRegister] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [registerUser] = useRegisterUserMutation();

  const [
    fetchToken,
    {
      data: tokenData,
      // isSuccess: isTokenSuccess,
      // isError: isTokenError,
      // error: tokenError,
    },
  ] = useFetchTokenMutation();

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
      console.log(res);
      // if (isUserSuccess) {
      //   console.log('isUserSuccess!!!!');
      // }
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

  const handleRegister = async(event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (username && password && email) {
      const res = await registerUser({ email, username, password });
      console.log(res);
    }
  }

  const toggleSkip = () => {
    setSkip((prev) => !prev);
  };

  return (
    <>
      <div>
        {tokenData && <p>tokenData: {tokenData.access_token}</p>}
        {isUserSuccess && <p>isUserSuccess: {String(isUserSuccess)}</p>}
        {userData && <p>userData: {userData.username}</p>}
        <p>Skip: {String(skip)}</p>
        <button onClick={toggleSkip}>Switch</button>
      </div>
      <section className="vh-100 gradient-custom">
        <div className="container">
          <h2>{!showRegister ? 'Login' : 'Register'}</h2>
          <p className="text-white-50 mb-4">
            {!showRegister
              ? 'Please enter your username and password'
              : 'Please enter user details'}
          </p>
          {showRegister && (
            <div className="form-outline form-white mb-4">
              <MDBInput
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                label="Email"
                className="form-control form-control-lg"
              />
            </div>
          )}
          <div className="form-outline form-white mb-4">
            <MDBInput
              type="text"
              name="username"
              value={username}
              onChange={handleChange}
              label="Username"
              className="form-control form-control-lg"
            />
          </div>
          <div className="form-outline form-white mb-4">
            <MDBInput
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              label="Password"
              className="form-control form-control-lg"
            />
          </div>
          {!showRegister ? (
            <button onClick={handleLogin} type="button">
              Login
            </button>
          ) : (
            <button onClick={handleRegister} type="button">
              Register
            </button>
          )}
          <div>
            {!showRegister ? (
              <>
                Don't have an account?
                <p
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowRegister(true)}
                >
                  Sign up
                </p>
              </>
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
        </div>
      </section>
    </>
  );
};

export default Auth;
