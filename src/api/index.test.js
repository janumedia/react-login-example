import React from "react";
import { screen, render, waitFor, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from 'react-router-dom';

import axios from "axios";
import { useApi } from ".";
import {AuthContext} from '../contexts/AuthContext';
import App from "../App";
import "../hooks/useCookie";
import LoginForm from "../LoginForm";

jest.mock('axios');

// jest.mock("axios", () => ({
//     defaults: {baseURL:'http://localhost:3333/'},

//     request: jest.fn().mockImplementation(()=> Promise.resolve({}))
//   }))

// IMPORTANT!
// to disable cookies implementations
// to avoid problem with next test
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

function Wrapper(children) {
    let api = {};
    function Wrapper() {
        Object.assign(api, useApi());
        return (
            <BrowserRouter>
                <AuthContext.Provider value={{...api}}>
                    { children }
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

const fakeToken = 'abcdefghijklmn';
const fakeUser = {username:'johndoe', firstName: 'John', lastName: 'Doe'};
const fakeResponseError = {status:404, data: 'Wrong Password!'};
const fakeRequestError = {};
const fakeMessageError = 'Server Error!';

describe('LoginForm', () => {
    beforeEach(() => {
         Wrapper(<LoginForm/>)
    })

    test('display empty username input', () => {
        const usernameInput = screen.getByLabelText('Username')
        expect(usernameInput).toBeInTheDocument();
        expect(usernameInput).toHaveAttribute('type', 'text');
        expect(usernameInput).toHaveValue('');
    })
    test('display empty password input', () => {
        const passwordInput = screen.getByLabelText('Password');
        expect(passwordInput).toBeInTheDocument();
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(passwordInput).toHaveValue('');
    })
    test('display submit button', () => {
        const submitBtn = screen.getByRole('button', {name: /sign in/i});
        expect(submitBtn).toBeInTheDocument();
        expect(submitBtn).toHaveAttribute('type', 'submit');
    })

    describe('Form validation:', () => {
        test('username input validation', async () => {
            const usernameInput = screen.getByLabelText('Username');
            
            fireEvent.blur(usernameInput)
            await screen.findByText(/Username is required/);

            userEvent.type(usernameInput, 'us');
            expect(usernameInput).toHaveValue('us');
            fireEvent.blur(usernameInput)
            await screen.findByText(/Username required 3 chars min./i);
            
            userEvent.clear(usernameInput)
            userEvent.type(usernameInput, 'user');
            await waitForElementToBeRemoved(screen.getByText(/Username required 3 chars min./i));
        })
        test('password input validation', async () => {
            const passwordInput = screen.getByLabelText('Password')
            
            fireEvent.blur(passwordInput)
            await screen.findByText(/Password is required/);

            userEvent.type(passwordInput, 'pa');
            expect(passwordInput).toHaveValue('pa');
            fireEvent.blur(passwordInput)
            await screen.findByText(/Password required 3 chars min./i);
            
            userEvent.clear(passwordInput)
            userEvent.type(passwordInput, 'pass');
            await waitForElementToBeRemoved(screen.getByText(/Password required 3 chars min./i));
        })
    })
})

describe('Login Integrations', () => {
    let api;
    beforeEach(() => {
        let res = Wrapper(<App/>)
        api = res.api;
    })

    afterEach(() => {
        api = null;
    })
    
    describe('Handle Login:', () => {
        test('Login Error: show error message with a close button', async() => {
            axios.request
            .mockRejectedValueOnce({response: fakeResponseError})
            .mockRejectedValueOnce({request: fakeRequestError})
            .mockRejectedValueOnce({message: fakeMessageError})
            .mockRejectedValueOnce({});

            const submitButton = screen.getByRole('button', {name: /sign in/i});
            
            userEvent.type(screen.getByLabelText('Username'), 'user');
            userEvent.type(screen.getByLabelText('Password'), 'pass');
            await waitFor(() => expect(submitButton).not.toBeDisabled())

            // 1st: test on response error
            fireEvent.click(submitButton);
            await waitFor(() => screen.findByText(fakeResponseError.data));
            expect(screen.queryByRole('alert')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).toHaveTextContent(fakeResponseError.status);
            expect(screen.queryByRole('alert')).toHaveTextContent(fakeResponseError.data);
            
            // 2nd: test on request error
            fireEvent.click(submitButton)
            await waitFor(() => screen.findByRole('alert'));
            
            // 3rd: on message error
            fireEvent.click(submitButton)
            await waitFor(() => screen.findByRole('alert'));
            
            // 4th: on other error
            fireEvent.click(submitButton)
            await waitFor(() => screen.findByRole('alert'));
            
            fireEvent.click(screen.getByLabelText('Close'));
            await waitForElementToBeRemoved(screen.getByRole('alert'))
        })

        test('Login Success: redirect to /dasboard, update navbar: show user info with "Logout" button', async () => {
            axios.request
            .mockResolvedValueOnce({data: {token: fakeToken}})
            .mockResolvedValueOnce({data: fakeUser});

            const submitButton = screen.getByRole('button', {name: /sign in/i});
        
            userEvent.type(screen.getByLabelText('Username'), 'user');
            userEvent.type(screen.getByLabelText('Password'), 'pass');
            
            await waitFor(() => expect(submitButton).not.toBeDisabled())

            fireEvent.click(submitButton);
            
            // tips: use waitFor to elimate `act` error message
            // https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
            await waitForElementToBeRemoved(screen.getByRole('form'));

            expect(window.location.pathname).toBe('/dashboard');
            expect(screen.getByText(`${fakeUser.firstName} ${fakeUser.lastName} (${fakeUser.username})`)).toBeInTheDocument();
            expect(screen.getByRole('heading', {level:2})).toHaveTextContent('Dashboard');
            expect(screen.getByText('Logout', {selector:'button'})).toBeInTheDocument();
            
            expect(api.isLoading).toBe(false);
            expect(api.token).toEqual(fakeToken);
            expect(api.user).toEqual(fakeUser);

            // extra test router navigate to home
            fireEvent.click(screen.getByText(/Home/));
            expect(window.location.pathname).toBe('/');
            expect(screen.getByRole('heading', {level:1})).toHaveTextContent('Home');
        })
    })

    describe('Handle Logout:', () => {
        test('Logout Success: redirect to /login, reset navbar', async () => {
            axios.request
            .mockResolvedValueOnce({data: {token: fakeToken}})
            .mockResolvedValueOnce({data: fakeUser});

            const submitButton = screen.getByRole('button', {name: /sign in/i});
        
            userEvent.type(screen.getByLabelText('Username'), 'user');
            userEvent.type(screen.getByLabelText('Password'), 'pass');
            
            await waitFor(() => expect(submitButton).not.toBeDisabled())

            fireEvent.click(submitButton);

            // tips: use waitFor to elimate `act` error message
            // https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
            await screen.findByText('Logout', {selector: 'button'});

            // logout
            fireEvent.click(screen.getByText('Logout', {selector:'button'}));
            
            await waitFor(() => {
                expect(screen.queryByText('Logout', {selector:'button'})).not.toBeInTheDocument()
            })

            expect(window.location.pathname).toBe('/login');

            expect(screen.queryByText(`${fakeUser.firstName} ${fakeUser.lastName} (${fakeUser.username})`)).not.toBeInTheDocument();
            expect(screen.getByRole('form')).toBeInTheDocument();

            expect(api.isLoading).toBe(false);
            expect(api.token).toEqual(null);
            expect(api.user).toEqual(null);
        })
    })
})