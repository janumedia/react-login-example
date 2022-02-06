import React, { useContext, useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import { useFetchData } from './api';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { Home } from './Home';
import { Button, Navbar, NavbarBrand, NavbarText } from 'reactstrap';

function App() {
  const {isLoading, resultData, setResultData, errorData, setErrorData, fecthData, getCookie, setCookie} = useFetchData();
  const [token, setToken] = useState<string | null | undefined>(getCookie('token'));
  const navigate = useNavigate();
  
  const logout = () => {
    setToken(null);
    setResultData(null);
    setCookie('token', null);
    setCookie('user', null);
    navigate('/login');
  }

  useEffect(() => {
    const cookie = getCookie('user');
    setResultData(cookie ? JSON.parse(cookie) : cookie);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="App">
      <AuthContext.Provider value={{token, setToken, isLoading, resultData, errorData, setErrorData, fecthData, setCookie}}>
        <Navbar
          color='dark'
          expand='md'
          dark
        >
          <NavbarBrand>Your Brand</NavbarBrand>
          {
            resultData?.username 
            ? (
              <NavbarText>
                <ul className='navbar-menu'>
                  <li><Link to='/'>Home</Link></li>
                  <li><Link to='/dashboard'>Dashboard</Link></li>
              <li>{resultData?.firstName} {resultData?.lastName} ({resultData?.username})</li>
                  <li>
                    <Button
                      color='light'
                      size='sm'
                      outline
                      onClick={()=> logout()}
                    >
                      Logout
                    </Button>
                  </li>
                </ul>
              </NavbarText>
            )
            : ''
          }
        </Navbar>
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
