import React, { useState } from 'react';
import LoginForm from './LoginForm';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import { useFetchData } from './api';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from './Dashboard';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const {isLoading, resultData, errorData, setErrorData, fecthData} = useFetchData();

  return (
    <div className="App">
      <AuthContext.Provider value={{token, setToken, isLoading, resultData, errorData, setErrorData, fecthData}}>
        <Routes>
          <Route path='/login' element={<LoginForm />}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
