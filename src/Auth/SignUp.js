/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, } from "react";
import { Box, Button, Container, TextField } from "@mui/material";
import CountrySelect from "./countrySelect";
import { AuthContext } from "./AuthContext";
import { AuthCss, AuthPages, AuthPanelWidth } from "./index";
import axios from "axios";
import "./signUp.css"
import { GlobalContext } from "../base/GlobalContext";
import { cr0 } from "../base/css";
import { Jwt } from "../models/Jwt";

export const SignUp = () => {
    const { SetAuthPage } = useContext(GlobalContext)

    const ToOneLanguage = language_ind => {
        const info_languages = {
            Title: ["Sign up", "注册"],
            CountryCodeTitle: ["US +1", "中国 +86"],
            CountryCode: [1, 86],
            PhoneNumberTitle: ["phone Number", "常用手机号"],
            PhoneError: ["phone number already registered", "该手机号已被注册"],
            PhoneBadFormat: ["phone number invalid", "输入有效的手机号码"],
            PasswordTitle: ["Password", "密码"],
            PasswordTooShort: ["password too weak, change to a stronger one", "密码太短,应为8-32位"],
            VerifyCodeTitle: ["SMS verification code", "输入短信验证码"],
            SMSCodeError: ["SMS verification code Error", "短信验证码错误"],
            TermAgreeTitle: ["I agree to the ", "注册即代表同意"],
            TermLinkTitle: ["Terms and Conditions", "注册条款"],
            RegisterTitle: ["Register", "注册"],
            HaveAccountAlready: ["Already have an account?", "已经有账号了？"],
            Login: ["Login", "登录"],
            //Footer: ["Together, life is bigger", "在一起，生命更放大"]
            Footer: ["Together, life is bigger", ""]
        }
        let ret = {}
        Object.keys(info_languages).map((k, i) => ret[k] = info_languages[k][language_ind])
        return ret
    }

    const info = ToOneLanguage(1)
    const {
        // nickname: [nickname, setNickname, nicknameError ],
        account: [account, setAccount, accountError],
        countryCode: [countryCode, setCountryCode, countryCodeError],
        phone: [phone, setPhone, phoneError, setPhoneError],
        password: [password, setPassword, passwordError,],
        SMSCode: [SMSCode, setSMSCode, SMSCodeError, setSMSCodeError, SMSButtonText, SMSButtonDisabled,],
        checkSMSCode, checkAccount, CheckPassword, checkCountryCode, checkPhone, SendSMSCode
    } = useContext(AuthContext)

    useEffect(() => !!account && checkAccount(false), [account])
    useEffect(() => !!password && CheckPassword(), [password])
    useEffect(() => !!countryCode && checkCountryCode(), [countryCode])
    useEffect(() => !!phone && checkPhone(), [phone])
    useEffect(() => !!SMSCode && checkSMSCode(), [SMSCode])

    const signUp = e => {
        let pass = checkAccount(false) && CheckPassword() && checkCountryCode() && checkPhone()
        pass && axios.post("/api/userSignUp", { countryCode, phone, "account":account.toLowerCase(), password, SMSCode: parseInt(SMSCode) })
            .then((ret) => {
                const error = ret.data.error
                if (error === "phone") setPhoneError("该手机号已被注册")
                else if (error === "SMSCode") setSMSCodeError("短信验证码错误")
                else if (error === "") {
                    Jwt.UpdateJWT()
                    SetAuthPage(AuthPages.None)
                }
            })
    }
    return <div key={"signUpBox"} style={AuthCss.containerL1}>
        <div style={AuthCss.containerL2}>
            <Box sx={{ m: "0 0 0 1em" }}><h2> {info["Title"]} </h2></Box>


            <TextField id="signUp-nickname" type="text" style={AuthCss.singleLineInputCss} label={accountError || "账户名"}
                onChange={e => setAccount(e.target.value)} error={!!accountError} size={"small"} variant="standard" autoFocus={true} />


            <TextField id="signUp-password" type="password" style={AuthCss.singleLineInputCss} label={info.PasswordTitle} size="small"
                variant="standard" error={!!passwordError} helperText={passwordError} onChange={e => setPassword(e.target.value)} />


            <div style={{ ...cr0,...AuthCss.singleLineInputCss,marginTop:"1em"}}>                 {/*选择国家*/}
                <CountrySelect width={200} disableCloseOnSelect countryCodeError={countryCodeError}
                    defaultValue={'CN'}
                    setCountryCode={setCountryCode} key={"signUp-CountrySelect"}> </CountrySelect>
                {/*填写手机号码*/} 
                <TextField id="signUp-phone" label={phoneError || info["PhoneNumberTitle"]} size="small"
                    variant="standard"
                    error={!!phoneError} onChange={e => setPhone(e.target.value)}
                    style={{ width: "70%" }} />
            </div>

            {/*手机校验码*/}
            <div style={{ ...cr0,...AuthCss.singleLineInputCss}} key={"input-SMS-code"}>
                <TextField id="signUp-SMS" type="number" label={info.VerifyCodeTitle} size="small" variant="standard"
                    helperText={SMSCodeError} onChange={e => setSMSCode(e.target.value)} error={!!SMSCodeError}
                    fullWidth={true}></TextField>
                <Button onClick={e => SendSMSCode(() => {
                    return checkCountryCode() && checkPhone()
                })}
                    style={{ width: 200 }} disabled={SMSButtonDisabled}>
                    {SMSButtonText}
                </Button>
            </div>

            <button className={"submit"} style={{...AuthCss.singleLineInputCss,marginTop:"1em"}} key={"sign-up-button"} onClick={e => signUp(e)}>
                {info.RegisterTitle} 
            </button>

            <div className={"cr0 agree_term_Container"} style={{...AuthCss.singleLineInputCss,marginTop:"0.5em"}} key={"agree-to-term"}>
                <div>{info.TermAgreeTitle}</div>
                <b style={{ margin: "0  0 0 .2em" }}><a href={"."}>{info.TermLinkTitle}</a></b>
            </div>

            <div className={"cr0 login_container"} style={{...AuthCss.singleLineInputCss,marginTop:"0.5em"}}>
                <div>{info.HaveAccountAlready}</div>
                <Button onClick={e => SetAuthPage(AuthPages.Login)}>{info.Login}</Button>
            </div>
        </div>

        <div className={"footer"}>{info.Footer}</div>
    </div>
}

