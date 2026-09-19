import { FC } from 'react';
import { SigninForm } from '../../components/SigninForm/SigninForm';
import block from 'bem-cn'
import './SigninPage.scss';

const cnStyles = block('home-page');

export const SigninPage:FC = () => {
  return (
    <main className={cnStyles()}>
      <h1 className={cnStyles('page-title')}>
        Авторизация
      </h1>
      <section className={cnStyles('section')}>
        <SigninForm />
      </section>
    </main>
  )
}