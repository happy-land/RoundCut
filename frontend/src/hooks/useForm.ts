import { ChangeEvent, useState } from 'react';
import { TForgotPasswordForm, TLoginForm } from '../utils/types';

export const useForm = (inputValues: TLoginForm | TForgotPasswordForm) => {
  const [values, setValues] = useState(inputValues);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value, name } = event.target;
    setValues({ ...values, [name]: value });
  };
  return { values, handleChange, setValues };
};
