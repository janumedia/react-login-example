import { useEffect, useState } from "react";
import { useCookie } from "../hooks/useCookie";
import { useFetchData } from "../hooks/useFetchData"

interface IUser {
    username: string,
    firstName?: string,
    lastName?: string
}

export const useApi = () => {
    const {isLoading, resultData, errorData, setErrorData, fecthData} = useFetchData();
    const {getCookie, setCookie} = useCookie();
    const [token, setToken] = useState<string | null | undefined>(getCookie('token'));
    const [user, setUser] = useState<IUser | null>(null);
    
    const login = (username:string, password:string):void => {
        if(!username || !password || username.length < 3 || password.length < 3)
        {
            setErrorData({
                code: 'ERROR',
                message: 'Username and Password should 3 chars minimum!'
            })
            return;
        }
        fecthData ({
            method: 'POST',
            url: '/login',
            data: {username, password}
        })
    }

    const getUser = (userToken:string):void => {
        fecthData ({
            method:'GET',
            url: '/user',
            headers: {
            authorization: userToken
            }
        })
    }

    const logout = ():void => {
        setToken(null);
        setUser(null);
        setCookie('token', null);
    }

    useEffect(() => {
        if(resultData?.token) {
            setToken(resultData.token);
            setCookie('token', resultData.token);
        }
        if(token && resultData?.username) {
            setUser(resultData);
        }
        if(errorData) logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resultData, errorData])

    return {
        isLoading,
        login,
        token,
        setToken,
        user,
        getUser,
        logout,
        errorData,
        setErrorData
    }
}