import React, { useState, useEffect } from "react";
import { AuthPages } from "../Auth";
import { Jwt } from "../models/Jwt";

//value of LeftDrawerSize should be number, which use in calcula
export const LeftDrawerSize = { None: 0, Short: 80, Long: 120 }

interface GlobalContextType {
    LoggedIn: boolean,
    leftDrawerSize: number,
    setLeftDrawerSize: React.Dispatch<React.SetStateAction<number>>,
    AuthBoxPage: AuthPages,
    SetAuthPage: React.Dispatch<React.SetStateAction<AuthPages>>,
    // UpdateJWT: (removeJWT?: boolean) => void;
    // SignOut: (e: any) => void;
    RedirectUrl: string,
    setRedirectUrl: React.Dispatch<React.SetStateAction<string>>,

}
export const GlobalContext = React.createContext<GlobalContextType | null>(null)

//这两个方法会被替换成正确的方法
let lastUseJwtTime = 0;

export const GlobalContextProvider: React.FC<React.ReactNode> = ({ children }) => {
    const [LoggedIn, setLoggedIn] = useState(false)

    const [RedirectUrl, setRedirectUrl] = useState("")
    const [AuthBoxPage, SetAuthPage] = useState(AuthPages.None)

    const [leftDrawerSize, setLeftDrawerSize] = useState(LeftDrawerSize.Short)

    useEffect(() => { Jwt.UpdateJWT(false, true) }, [])

    // if LoggedOut, update Context States

    const LoadJwt = () => {
        if (lastUseJwtTime === Jwt.LastGetJwtTime) return
        lastUseJwtTime = Jwt.LastGetJwtTime
        setLoggedIn(Jwt.Get().IsValid())
    }
    const AutoReloadJwt = () => {
        setInterval(LoadJwt, 100)
        return () => { };
    };

    useEffect(AutoReloadJwt, [])

    const store = {
        LoggedIn,
        leftDrawerSize,
        setLeftDrawerSize,
        AuthBoxPage,
        SetAuthPage,
        RedirectUrl,
        setRedirectUrl,
    }

    return <GlobalContext.Provider value={store} > {children} </GlobalContext.Provider>
}