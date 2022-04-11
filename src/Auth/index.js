/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext } from "react";
import { Login } from "./login";
import { SignUp } from "./SignUp";
import { MyProfile } from "./my-profile";
import { ForgotPassword } from "./forgot-password";
import { Popover } from "@mui/material";
import { AuthContextComponent } from "./AuthContext";
import { GlobalContext } from "../base/GlobalContext";

export const AuthPanelWidth = 400

export const AuthPages = { None: null, SignUp: "SignUp", MyProfile: "MyProfile", ForgotPassword: "ForgotPassword", Login: "Login" }
export const AuthPopper = () => {
    const { AuthBoxPage: page, SetAuthPage } = useContext(GlobalContext)

    const popoverCSS = { top: 200, left: (window.innerWidth - AuthPanelWidth) / 2 }
    const Close = e => SetAuthPage(AuthPages.None)
    return <AuthContextComponent>
        <div style={{ width: "100%", height: "100%" }}>
            <Popover id={"authPop"} open={!!page} onClose={Close} anchorReference="anchorPosition" anchorPosition={popoverCSS}>
                {page === AuthPages.SignUp && <SignUp />}
                {page === AuthPages.MyProfile && <MyProfile />}
                {page === AuthPages.ForgotPassword && <ForgotPassword />}
                {page === AuthPages.Login && <Login />}
            </Popover>
        </div>
    </AuthContextComponent>
}

