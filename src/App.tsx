import React, { useContext, useState } from 'react';
import LoginForm from './LoginForm';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import { useFetchData } from './api';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { Home } from './Home';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const {isLoading, resultData, errorData, setErrorData, fecthData} = useFetchData();

  return (
    <div className="App">
      <AuthContext.Provider value={{token, setToken, isLoading, resultData, errorData, setErrorData, fecthData}}>
        <Routes>
          <Route path='/' element={
            <Requireuth>
              <Home/>
            </Requireuth>
          }/>
          <Route path='/login' element={<LoginForm />}/>
          <Route path='/dashboard' element={
            <Requireuth>
              <Dashboard/>
            </Requireuth>
          }/>
        </Routes>
      </AuthContext.Provider>
    </div>
  );
}

function Requireuth({children} : {children:JSX.Element}) {
  const location = useLocation();
  const {token} = useContext(AuthContext);

  if(token == null) return (<Navigate to='/login' state={{from: location}} replace/>);
  return children;
}

export default App;
