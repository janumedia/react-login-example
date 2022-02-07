import React, { useContext, useEffect } from 'react';
import LoginForm from './LoginForm';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { Home } from './Home';
import { Button, Navbar, NavbarBrand, NavbarText } from 'reactstrap';
import { useApi } from './api';

function App() {

  const {isLoading, login, token, user, getUser, logout, errorData, setErrorData} = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  }
  
  useEffect(() => {
    if(token && !user && location?.pathname !== '/login') getUser(token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="App">
      <AuthContext.Provider value={{isLoading, login, token, user, getUser, logout, errorData, setErrorData}}>
        <Navbar
          color='dark'
          expand='md'
          dark
        >
          <NavbarBrand>Your Brand</NavbarBrand>
          {
            user?.username 
            ? (
              <NavbarText>
                <ul className='navbar-menu'>
                  <li><Link to='/'>Home</Link></li>
                  <li><Link to='/dashboard'>Dashboard</Link></li>
                  <li>{user?.firstName} {user?.lastName} ({user?.username})</li>
                  <li>
                    <Button
                      color='light'
                      size='sm'
                      outline
                      onClick={()=> handleLogout()}
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
          <Route element={<RequireAuth/>}>
            <Route path='/' element={<Home/>}/>
            <Route path='/dashboard' element={<Dashboard/>}/>
          </Route>
          <Route path='/login' element={<LoginForm />}/>
          <Route path='/*' element={(<div className='layout'><h1>404</h1><p>Page Not Found!</p></div>)}/>
        </Routes>
      </AuthContext.Provider>
    </div>
  );
}

function RequireAuth():any{
  const location = useLocation();
  const {token} = useContext(AuthContext);
  return (
    token == null
    ? <Navigate to='/login' state={{from: location}} replace/>
    : <Outlet/>
  );
}

export default App;