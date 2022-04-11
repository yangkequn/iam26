/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, } from "react";
import { Button, TextField, } from "@mui/material";
import { AuthPages, AuthPanelWidth } from "./index";
import { cr0 } from "../base/css";
import CountrySelect from "./countrySelect";
import { AuthContext } from "./AuthContext";
import { GlobalContext } from "../base/GlobalContext";
import axios from "axios";
import "./auth.css"
import { Jwt } from "../models/Jwt";

export const Login = () => {
    const { SetAuthPage } = useContext(GlobalContext)
    const ToOneLanguage = (l) => {
        const MenuText = {
            Title: ["Login", "账号登录"][l],
            CountryCodeTitle: ["US +", "美国 +"][l],
            AccountTitle: ["Type Account Here", "手机号/账号"][l],
            ForeignPhoneMode: ["Foreign Phone login", "海外手机号登录"][l],
            ForgotPassword: ["Forgot password", "忘记密码?"][l],
            MailAccountLogin: ["Login with Phone or email", "邮箱帐号登录"][l],
            CountryCode: [1, 86][l],
            PhoneNumberTitle: ["phone Number", "请输入手机号"][l],
            AccountPasswordError: ["Error account or password ", "账号或密码错误"][l],
            PhoneBadFormat: ["phone number invalid", "输入有效的手机号码"],
            PasswordTitle: ["Password", "登录密码"][l],
            PasswordBadFormat: ["password too short", "密码太短"][l],
            LoginTitle: ["Login", "登录"][l],
            WithoutAnAccount: ["Don't have an account yet?", "没有账号？"][l],
            Signup: ["Sign up", "注册"][l],
            Footer: ["Together, life is bigger", "在一起，生命更放大"][l]
        }
        return MenuText
    }
    const info = ToOneLanguage(1)

    const {
        countryCode: [countryCode, setCountryCode, countryCodeError],
        phone: [phone, setPhone, phoneError],
        account: [account, setAccount, accountError, setAccountError],
        password: [password, setPassword, passwordError],
        foreignPhone: [foreignPhone, setForeignPhone],
        checkCountryCode, checkPhone, checkAccount, CheckPassword
    } = useContext(AuthContext)

    useEffect(() => !!countryCode && checkCountryCode(), [countryCode])
    useEffect(() => !!phone && checkPhone(), [phone])
    useEffect(() => !!account && checkAccount(false), [account])
    useEffect(() => !!password && CheckPassword(), [password])

    const login = (e) => {
        let ok = foreignPhone && checkCountryCode() && checkPhone() && CheckPassword()
        if (!ok) ok = !foreignPhone && checkAccount(false) && CheckPassword()

        ok && axios.post("/api/userLogin", { countryCode, account: account || phone, password })
            .then((ret) => {
                const error = ret.data.error
                if (error === "account") setAccountError("账号或密码错误")
                else if (error === "") {
                    Jwt.UpdateJWT(true)
                    SetAuthPage(AuthPages.None)
                }
            })
    }
    const css={
        LoginContainer:{
            display: "flex", flexDirection: "column" , width: AuthPanelWidth, background: "#ffffff",
            color: "#000", padding: "3em 2em 0em 2em",
        }
    }
    return <div className=" login-container">
        <div style={css.LoginContainer}>
            <div><h2> {info["Title"]} </h2></div>

            <div style={{ ...cr0, display: foreignPhone ? "flex" : "none" }}>
                {/*选择国家*/}
                <CountrySelect width={"250px"} disableCloseOnSelect countryCodeError={countryCodeError}
                    defaultValue={"CN"}
                    setCountryCode={setCountryCode}> </CountrySelect>
                {/*填写手机号码*/}
                <TextField id="signUp-phone" label={phoneError || info["PhoneNumberTitle"]} size="small"
                    variant="standard"
                    error={!!phoneError} onChange={e => setPhone(e.target.value)}
                    style={{ width: "100%" }} />
            </div>


            {!foreignPhone && <TextField id="login-phone" label={accountError || info["AccountTitle"]} size="small"
                variant="standard"
                error={!!accountError} onChange={e => setAccount(e.target.value)}
                style={{ width: "100%" }} />}

            {/*密码框*/}
            <TextField id="login-password" label={passwordError || info["PasswordTitle"]} size="small" type={"password"}
                variant="standard"
                error={!!passwordError} onChange={e => setPassword(e.target.value)}
                style={{ width: "100%" }} />

            <div style={{ ...cr0, justifyContent: "space-between", color: "#25a", margin: "1.3em 0 1.0em 0" }}
                key={"user_foreign_phone"}>
                <Button onClick={e => {
                    let ToBeForeignMode = !foreignPhone
                    setCountryCode(ToBeForeignMode ? 1 : 86);
                    if (ToBeForeignMode) setAccount("")
                    else setPhone("")
                    setForeignPhone(!foreignPhone);
                }}>
                    {!foreignPhone ? info.ForeignPhoneMode : info.MailAccountLogin}
                </Button>


                <div onClick={e => SetAuthPage(AuthPages.ForgotPassword)} key={"user_forgot_password"}
                    style={{ color: "#8590a6" }}>
                    {info.ForgotPassword}
                </div>
            </div>


            <button className={"submit"} key={"login-button"} onClick={e => login(e)}>
                {info.LoginTitle}
            </button>

            <div className={"cr0 login_container"}>
                <div>{info.WithoutAnAccount}</div>
                <Button onClick={e => SetAuthPage(AuthPages.SignUp)}>{info.Signup}</Button>
            </div>
        </div>
        <div className={"footer"}>{info.Footer}</div>
    </div>
}
