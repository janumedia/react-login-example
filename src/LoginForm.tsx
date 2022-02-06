import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";

const LoginForm = () => {
  const {token, setToken, resultData, errorData, fecthData} = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Result', resultData);
    if(resultData?.token) {
      setToken(resultData.token);

      // get for user data and check if token is valid
      fecthData({
        method:'GET',
        url: '/user',
        headers: {
          authorization: resultData.token
        }
      })

    } else if (token && resultData?.username) {
      navigate('/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultData])

  useEffect(() => {
    console.log('ERROR', errorData);
  }, [errorData])
  
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fecthData ({
      method: 'POST',
      url: '/login',
      data: {username, password}
    })
  };

  return (
    <form className="form" onSubmit={submit}>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button type="submit">Sign in</button>
      </div>
    </form>
  );
};

export default LoginForm;
