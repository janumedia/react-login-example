import { screen, render, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from 'react-router-dom';

import axios from "axios";
import { useApi } from ".";
import {AuthContext} from '../contexts/AuthContext';
import App from "../App";
import "../hooks/useCookie";

jest.mock('axios');

// jest.mock("axios", () => ({
//     defaults: {baseURL:'http://localhost:3333/'},

//     request: jest.fn().mockImplementation(()=> Promise.resolve({}))
//   }))

// IMPORTANT!
// to disable cookies implementations and resistant for next test assertion
jest.mock('../hooks/useCookie', () => {
    return {
        useCookie: () => {
            return {
                getCookie: () => null,
                setCookie: () => {}
            }
        }
    }
})

function LoginWrapper() {
    let api = {};
    function Wrapper() {
        Object.assign(api, useApi());
        return (
            <BrowserRouter>
                <AuthContext.Provider value={{...api}}>
                    {/* <AuthContext.Consumer>
                        {
                            (value) => (
                                <>
                                    <h1>isLoading: {(value.isLoading).toString()}</h1>
                                    <p>{token}</p>
                                    <button onClick={() => value.login('admin', 'pass')}>Click</button>
                                </>
                            )
                        }
                    </AuthContext.Consumer> */}
                    {/* <Routes>
                        <Route path="/" element={<LoginForm/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                    </Routes> */}
                    <App/>
                </AuthContext.Provider>
            </BrowserRouter>
        );
    }
    const component = render(<Wrapper/>)
    return {
        component,
        api
    }
}

function clearInput(...inputs) {
    inputs.map(i => userEvent.clear(i));
}

const fakeToken = 'abcdefghijklmn';
const fakeUser = {username:'johndoe', firstName: 'John', lastName: 'Doe'};
const fakeError = {status:404, data: 'Wrong Password!'}

describe('Login Test', () => {
    let container, api;
    beforeEach(async () => {
        let res = LoginWrapper()
        api = res.api;
        container = res.component.container;
    })

    afterEach(() => {
        container = null;
    })
    describe('Default Login Page', ()=> {
        test('Has a Navigation bar only with a brand name', async() => {
            expect(screen.queryByRole('navigation')).toBeInTheDocument();
            expect(container.querySelector('.navbar-brand')).toBeInTheDocument();
            expect(container.querySelector('.navbar-text')).not.toBeInTheDocument();
        })
        test('Has a Form with name = "login-form"', () => {
            expect(screen.getByRole('form')).toBeInTheDocument();
            expect(screen.getByRole('form')).toHaveAttribute('name', 'login-form');
        })
        test('Has an empty Username input with label = "Username"', () => {
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
            expect(container.querySelector('input[type=text]')).toBeInTheDocument();
            expect(container.querySelector('input[type=text]')).toHaveValue('');
        })
        test('Has an empty Password input with label = "Password"', () => {
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
            expect(container.querySelector('input[type=password]')).toBeInTheDocument();
            expect(container.querySelector('input[type=password]')).toHaveValue('');
        })

        test('Has a disabled type = "submit" button', async () => {
            expect(container.querySelector('button[type=submit]')).toBeInTheDocument();
            expect(container.querySelector('button[type=submit]')).toBeDisabled(true);
        })

        test('Has NO Alert', () => {
            expect(screen.queryByRole('alert')).toBeNull();
        })
    })

    describe('Handle Login', () => {
        test('Disable login with invalid input ( < 3 chars)', async() => {
            const usernameInput = container.querySelector('input[type=text]');
            const passwordInput = container.querySelector('input[type=password]');
            const submitButton = container.querySelector('button[type=submit]');
            
            // with empty input
            expect(submitButton).toBeDisabled(true);
            
            // with invalid username input
            userEvent.type(usernameInput, 'us');
            expect(submitButton).toBeDisabled(true);
            
            // with invalid password input
            clearInput(usernameInput, passwordInput);
            userEvent.type(passwordInput, 'pa');
            expect(submitButton).toBeDisabled(true);
            
            // with invalid username or password input
            clearInput(usernameInput, passwordInput);
            userEvent.type(usernameInput, 'user');
            userEvent.type(passwordInput, 'pa');
            expect(submitButton).toBeDisabled(true);

            clearInput(usernameInput, passwordInput);
            userEvent.type(usernameInput, 'us');
            userEvent.type(passwordInput, 'pass');
            userEvent.click(submitButton);
            expect(submitButton).toBeDisabled(true);
        })

        test('Enable login with valid input  ( >= 3 chars)', async() => {
            userEvent.type(container.querySelector('input[type=text]'), 'user');
            userEvent.type(container.querySelector('input[type=password]'), 'pass');
            expect(container.querySelector('button[type=submit]')).toBeEnabled(true);
        })

        test('Login Error: Show Alert', async() => {
            axios.request
            .mockRejectedValueOnce({response: fakeError});

            const submitButton = container.querySelector('button[type=submit]');

            userEvent.type(container.querySelector('input[type=text]'), 'user');
            userEvent.type(container.querySelector('input[type=password]'), 'pass');
            expect(submitButton).toBeEnabled(true);
            userEvent.click(submitButton);
            expect(submitButton).toBeDisabled(true);
            expect(api.isLoading).toBe(true);

            // tips: use wait to elimate `act` error message
            // https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
            await waitFor(() => api.user)
            expect(api.isLoading).toBe(false);
            expect(screen.queryByRole('alert')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).toHaveTextContent(fakeError.status);
            expect(screen.queryByRole('alert')).toHaveTextContent(fakeError.data);
            expect(submitButton).toBeEnabled(true);
        })

        test('Login Success: Redirect to Dasboard, update navbar: show "Logout" button', async () => {
            axios.request
            .mockResolvedValueOnce({data: {token: fakeToken}})
            .mockResolvedValueOnce({data: fakeUser});

            const submitButton = container.querySelector('button[type=submit]');

            // login
            userEvent.type(container.querySelector('input[type=text]'), 'user');
            userEvent.type(container.querySelector('input[type=password]'), 'pass');
            userEvent.click(submitButton);
            expect(submitButton).toBeDisabled(true);
            expect(api.isLoading).toBe(true);

            // tips: use wait to elimate `act` error message
            // https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
            await waitFor(() => api.user)
            expect(api.isLoading).toBe(false);
            expect(api.token).toEqual(fakeToken);
            expect(api.user).toEqual(fakeUser);
            expect(container.querySelector('.navbar-text')).toBeInTheDocument();
            expect(screen.getByRole('heading', {level:2})).toHaveTextContent('Dashboard');
            expect(screen.getByText('Logout', {selector:'button'})).toBeInTheDocument();
        })
    })

    describe('Handle Logout', () => {
        test('Logout success: Redirect to Login Form, reset navbar', async () => {
            axios.request
            .mockResolvedValueOnce({data: {token: fakeToken}})
            .mockResolvedValueOnce({data: fakeUser});

            // login
            userEvent.type(container.querySelector('input[type=text]'), 'user');
            userEvent.type(container.querySelector('input[type=password]'), 'pass');
            userEvent.click(container.querySelector('button[type=submit]'));
            // // tips: use wait to elimate `act` error message
            // // https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
            await waitFor(() => api.user)
            
            // logout
            userEvent.click(screen.getByText('Logout', {selector:'button'}));
            await waitFor(() => !api.token);
            expect(api.isLoading).toBe(false);
            expect(api.token).toEqual(null);
            expect(api.user).toEqual(null);
            expect(container.querySelector('.navbar-text')).not.toBeInTheDocument();
            expect(screen.getByRole('form')).toBeInTheDocument();
            expect(screen.getByRole('form')).toHaveAttribute('name', 'login-form');
        })
    })

})