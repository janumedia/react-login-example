import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";

axios.defaults.baseURL = 'http://localhost:3333/';

interface IErrorData {
    code: any,
    message: any
}

export const useFetchData = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [resultData, setResultData] = useState<any>(null);
    const [errorData, setErrorData] = useState<IErrorData | null>(null);
    const [options, setOptions] = useState<AxiosRequestConfig<any> | null>(null);

    const fecthData = (options:AxiosRequestConfig<any>) => {
        setOptions(options);
    }

    useEffect(() => {
        if(options) {
            setIsLoading(true);
            axios(options).then(({data}) => {
                setResultData(data);
                setIsLoading(false);
            }).catch(({response, request, message}) => {
                if(response) {
                    setErrorData({
                        code: response?.status,
                        message: response?.data
                    })
                } else if(request) {
                    setErrorData({
                        code: 'ERROR',
                        message: 'XMLHttpRequest failed!'
                    })
                } else if(message) {
                    setErrorData({
                        code: 'ERROR',
                        message: JSON.stringify(message)
                    })
                } else {
                    setErrorData({
                        code: 'ERROR',
                        message: 'Invalid request!'
                    })
                }
                setIsLoading(false);
            })
        }

    }, [options]);

    return {
        isLoading,
        resultData,
        setResultData,
        errorData,
        setErrorData,
        fecthData
    }
}