import React, {createContext, useContext, useState} from 'react';

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [isLoggedIn, setLoggedIn] = useState(localStorage.getItem("token") ? true: false);

    const login = (token) => {
        localStorage.setItem("token", token);
        setLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    return useContext(AuthContext);
};

export {AuthProvider, useAuth};