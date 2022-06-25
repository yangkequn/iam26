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

    HeartRate: number,
    setHeartRate: React.Dispatch<React.SetStateAction<number>>,
    AcceleroData: number[],
    setAcceleroData: React.Dispatch<React.SetStateAction<number[]>>,
    audioChunk: Blob[],
    setAudioChunk: React.Dispatch<React.SetStateAction<Blob[]>>,

}
export const GlobalContext = React.createContext<GlobalContextType | null>(null)

//这两个方法会被替换成正确的方法

export const GlobalContextProvider: React.FC<React.ReactNode> = ({ children }) => {
    const [LoggedIn, setLoggedIn] = useState(false)

    const [RedirectUrl, setRedirectUrl] = useState("")
    const [AuthBoxPage, SetAuthPage] = useState(AuthPages.None)

    const [leftDrawerSize, setLeftDrawerSize] = useState(LeftDrawerSize.Short)

    const [HeartRate, setHeartRate] = useState(0)
    const [AcceleroData, setAcceleroData] = useState([] as number[])
    const [audioChunk, setAudioChunk] = useState<Blob[]>()
    useEffect(() => {
        const LoadJwt = (event: Event) => {
            setLoggedIn(Jwt.Get().IsValid())
        }
        //check if localstorage has jwt
        LoadJwt(null)
        // check if jwt is expired online
        Jwt.UpdateJWT(false, true)
        //check if jwt is updated
        window.addEventListener(Jwt.eventName, LoadJwt)
        return () => window.removeEventListener(Jwt.eventName, LoadJwt)
    })
    // if LoggedOut, update Context States


    const store = {
        LoggedIn,
        leftDrawerSize,
        setLeftDrawerSize,
        AuthBoxPage,
        SetAuthPage,
        RedirectUrl,
        setRedirectUrl,
        HeartRate, setHeartRate,
        AcceleroData, setAcceleroData,
        audioChunk, setAudioChunk
    }

    return <GlobalContext.Provider value={store} > {children} </GlobalContext.Provider>
}