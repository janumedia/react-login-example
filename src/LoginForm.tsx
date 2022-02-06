import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, FormGroup, Input, Label } from "reactstrap";
import { AuthContext } from "./contexts/AuthContext";

const LoginForm = () => {
  const {token, setToken, isLoading, resultData, errorData, setErrorData, fecthData, setCookie} = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if(resultData?.token) {
      setToken(resultData.token);
      setCookie('token', resultData.token);
      // get for user data and check if token is valid
      fecthData({
        method:'GET',
        url: '/user',
        headers: {
          authorization: resultData.token
        }
      })

    } else if (token && resultData?.username) {
      setCookie('user', JSON.stringify(resultData));
      navigate('/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultData])

  // useEffect(() => {
  //   console.log('ERROR', errorData);
  // }, [errorData])
  
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fecthData ({
      method: 'POST',
      url: '/login',
      data: {username, password}
    })
  };

  return (
    <div className="LoginForm layout">
      <Form onSubmit={submit}>
        <FormGroup>
          <Label>Username</Label>
          <Input
            type="text"
            placeholder="Your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Button
            type="submit"
            color="dark"
            disabled={isLoading}
          >
            { isLoading ? 'Signing In...' : 'Sign In' }
          </Button>
        </FormGroup>
        <Alert
          color="warning"
          isOpen={errorData !== null}
          toggle={() => setErrorData(null)}
        >
          <b>{errorData?.code}</b>
          <p>{errorData?.message}</p>
        </Alert>
      </Form>
    </div>
  );
};

export default LoginForm;
