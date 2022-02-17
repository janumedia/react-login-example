import { useFormik } from "formik";
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { AuthContext } from "./contexts/AuthContext";
import * as Yup from "yup";

const LoginForm = () => {
  const {isLoading, login, token, user, getUser, errorData, setErrorData} = useContext(AuthContext);
  const navigate = useNavigate();

  const {handleSubmit, handleChange, handleBlur, values, touched, errors} = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: Yup.object({
      username: Yup.string().min(3, 'Username required 3 chars min.').required('Username is required'),
      password: Yup.string().min(3, 'Password required 3 chars min.').required('Password is required')
    }),
    onSubmit: values => login(values.username, values.password)
  });
  
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
        <Form name="login-form" onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="username">
              Username
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Your Username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                autoFocus
                invalid={touched.username !== undefined && errors.username !== undefined}
              />
              {
                touched.username && errors.username && (<FormFeedback>{errors.username}</FormFeedback>)
              }
            </Label>
            
          </FormGroup>
          <FormGroup>
            <Label for="password">
              Password
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Your Password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={touched.password !== undefined && errors.password !== undefined}
              />
              {
                touched.password && errors.password && (<FormFeedback>{errors.password}</FormFeedback>)
              }
            </Label>
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
        )
      }
    </div>
  );
};

export default LoginForm;
