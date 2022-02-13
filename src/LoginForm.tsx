import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, FormGroup, Input, Label } from "reactstrap";
import { AuthContext } from "./contexts/AuthContext";

const LoginForm = () => {
  const {isLoading, login, token, user, getUser, errorData, setErrorData} = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password)
  };
  
  useEffect(() => {
    if(token && !user) getUser(token);
    if(user) navigate('/dashboard');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user])

  return (
    <div className="LoginForm layout">
      {
        token && !user
        ? 'Getting User...' 
        : (
        <Form name="login-form" onSubmit={submit}>
          <FormGroup>
            <Label>
              Username
              <Input
                type="text"
                placeholder="Your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </Label>
            
          </FormGroup>
          <FormGroup>
            <Label>
              Password
              <Input
                type="password"
                placeholder="Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Label>
          </FormGroup>
          <FormGroup>
            <Button
              type="submit"
              color="dark"
              disabled={isLoading || (username.length < 3 || password.length < 3)}
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
        )
      }
    </div>
  );
};

export default LoginForm;
