import React, { createContext, useReducer } from 'react'
import { reducer } from './reducer';


let data = {
    user: {},
    role: null,
    isLogin: null,
    darkTheme: true
}
export const GlobalContext = createContext(data);


export default function ContextProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, data)
    return (
        <GlobalContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalContext.Provider>
    )
}