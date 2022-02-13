import React, { useContext } from 'react';
import LoginForm from './LoginForm';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { Home } from './Home';
import { Button, Navbar, NavbarBrand, NavbarText } from 'reactstrap';

function App() {

  const {user, logout} = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  }
  
  return (
    <div className="App">
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
    </div>
  );
}

function RequireAuth():any{
  const location = useLocation();
  const {token, user} = useContext(AuthContext);
  return (
    token && user
    ? <Outlet/>
    :<Navigate to='/login' state={{from: location}} replace/>
  );
}

export default App;