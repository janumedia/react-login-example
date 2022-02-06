import React, { useState } from 'react';
import LoginForm from './LoginForm';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import { useFetchData } from './api';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const {isLoading, resultData, errorData, setErrorData, fecthData} = useFetchData();

  return (
    <div className="App">
      <AuthContext.Provider value={{token, setToken, isLoading, resultData, errorData, setErrorData, fecthData}}>
        <LoginForm />
      </AuthContext.Provider>
    </div>
  );
}

export default App;
