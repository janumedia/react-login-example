import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { useApi } from './api';
import { AuthContext } from './contexts/AuthContext';

function Wrapper ({children} : {children:JSX.Element}) {
  const {isLoading, login, token, user, getUser, logout, errorData, setErrorData} = useApi();  
  return (
    <AuthContext.Provider value={{isLoading, login, token, user, getUser, logout, errorData, setErrorData}}>
      {children}
    </AuthContext.Provider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Wrapper>
        <App />
      </Wrapper>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
