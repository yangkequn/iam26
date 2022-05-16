/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext } from "react";
import { Login } from "./login";
import { SignUp } from "./SignUp";
import { MyProfile } from "./my-profile";
import { ForgotPassword } from "./forgot-password";
import { Popover } from "@mui/material";
import { AuthContextComponent } from "./AuthContext";
import { GlobalContext } from "../base/GlobalContext";
import { cr0 } from "../base/css";

export const AuthPanelWidth = Math.min(450, window.innerWidth)
export const AuthCss = {
    inputContainer: { ...cr0, justifyContent: "space-between", margin: "0em 0 1.0em 0", },
    containerL1: {
        display: "flex", flexDirection: "column", width: "100%",
        height: "100%", background: "#f7f9fb", alignItems: "center",
    },
    containerL2: {
        display: "flex",
        flexDirection: "column",
        width: 100 + "%",
        background: "#ffffff",
        color: "#000",
        padding: "2em 2em 0em 2em",
    },
    button: {
        margin: "0 0 0 1em",
        lineHeight: 1.0,
        border: "0px",
        width: "120px",
        color: "#89a",
        background: "#ffffff"
    },
    singleLineInputCss: { margin: "0 1em 0 1em", width: "90%" },
    submit: {
        ...cr0, margin: "1em 0 0 0em", lineHeight: 1.5, height: "36px",
        background: "#0066ff", justifyContent: "center", color: "#ffffff", borderRadius: "4px",
    },
}
export const AuthPages = { None: null, SignUp: "SignUp", MyProfile: "MyProfile", ForgotPassword: "ForgotPassword", Login: "Login" }
export const AuthPopper = () => {
    const { AuthBoxPage: page, SetAuthPage } = useContext(GlobalContext)

    const popoverCSS = { top: 200, left: (window.innerWidth - AuthPanelWidth) / 2 }
    const Close = e => SetAuthPage(AuthPages.None)
    return <AuthContextComponent>
        <Popover id={"authPop"} open={!!page} onClose={Close} anchorReference="anchorPosition" anchorPosition={popoverCSS}>
            {page === AuthPages.SignUp && <SignUp />}
            {page === AuthPages.MyProfile && <MyProfile />}
            {page === AuthPages.ForgotPassword && <ForgotPassword />}
            {page === AuthPages.Login && <Login />}
        </Popover>
    </AuthContextComponent>
}

