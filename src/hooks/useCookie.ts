import Cookies from "js-cookie";

export const useCookie = () => {
    const setCookie = (key:string, value:any) => {
        if(value) Cookies.set(key, JSON.stringify(value));
        else Cookies.remove(key);
    }
    const getCookie = (key:string):any => {
        const value = Cookies.get(key);
        return !value || !isJSON(value) ? value : JSON.parse(value);
    }

    return {
        getCookie,
        setCookie
    }
}

function isJSON(value:string):boolean {
    try {
        JSON.parse(value);
    } catch (e) {
        return false;
    }
    return true;
}