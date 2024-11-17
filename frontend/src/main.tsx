import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App/App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store.ts';
// import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <ToastContainer />
        <App />
      </Provider>
    </Router>
  </React.StrictMode>,
);
