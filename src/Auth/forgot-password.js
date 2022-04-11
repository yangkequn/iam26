/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from "react";
import axios from "axios";
import { cr0, cr1, cv0, cv1 } from "../base/css";
import { AuthPages } from "./index";
import { AuthContext } from "./AuthContext";
import CountrySelect from "./countrySelect";
import { GlobalContext } from "../base/GlobalContext";
import { Button, TextField } from "@mui/material";

const ToOneLanguage = (language_ind) => {
    const infoMultiLanguages = {
        Title: ["Reset Password", "找回密码"],
        Annotation: ["Check code will sent to e-mailbox or phone", "验证码将会发送至邮箱或手机"],
        CountryCodeTitle: ["US +", "美国 +"],
        AccountTitle: ["Type Account Here", "输入手机号/邮箱"],
        ForeignPhoneMode: ["Foreign Phone Reset Password", "海外手机号找回"],
        ForgotPassword: ["Forgot password", "忘记密码?"],
        MailAccountLogin: ["Login with Phone or email", "邮箱帐号登录"],
        CountryCode: [1, 86],
        PhoneNumberTitle: ["phone Number", "请输入手机号"],
        AccountPasswordError: ["Error account or password ", "账号或密码错误"],
        PhoneBadFormat: ["phone number invalid", "输入有效的手机号码"],
        PasswordTitle: ["Password", "请输人新的密码"],
        VerifyCodeTitle: ["SMS verification code", "输入校验码"],
        PasswordBadFormat: ["password too short", "密码太短"],
        ResetTitle: ["Reset password", "重置密码"],
        WithoutAnAccount: ["Don't have an account yet?", "没有账号？"],
        Signup: ["Sign up", "注册"],
        Footer: ["Together, life is bigger", " "]
    }
    let ret = {}
    Object.keys(infoMultiLanguages).map((k, i) => ret[k] = infoMultiLanguages[k][language_ind])
    return ret
}

const forgetPasswordCss = () => ({
    inputContainer: { ...cr0, justifyContent: "space-between", margin: "0em 0 1.0em 0", },
    containerL1: { ...cv0, height: "100%", background: "#f7f9fb", alignItems: "center", },
    containerL2: { ...cv1, width: "400px", background: "#ffffff", color: "#000", padding: "3em 2em 0em 2em", },
    button: {
        margin: "0 0 0 1em",
        lineHeight: 1.0,
        border: "0px",
        width: "120px",
        color: "#89a",
        background: "#ffffff"
    },
    submit: {
        ...cr0, margin: "1em 0 0 0em", lineHeight: 1.5, height: "36px",
        background: "#0066ff", justifyContent: "center", color: "#ffffff", borderRadius: "4px",
    },
})
export const ForgotPassword = () => {
    const { SetAuthPage } = useContext(GlobalContext)

    const info = ToOneLanguage(1)
    const css = forgetPasswordCss()
    const {
        countryCode: [countryCode, setCountryCode, countryCodeError,],
        phone: [phone, setPhone, phoneError,],
        account: [account, setAccount, accountError,],
        password: [password, setPassword, passwordError,],
        foreignPhone: [foreignPhone, setForeignPhone],
        SMSCode: [SMSCode, setSMSCode, SMSCodeError, SMSButtonText, SMSButtonDisabled,],
        checkAccount, CheckPassword, checkCountryCode, checkPhone, checkSMSCode, SendSMSCode
    } = useContext(AuthContext);

    useEffect(() => !!account && checkAccount(), [account])
    useEffect(() => !!password && CheckPassword(), [password])

    useEffect(() => !!countryCode && checkCountryCode(), [countryCode])
    useEffect(() => !!phone && checkPhone(), [phone])
    useEffect(() => !!SMSCode && checkSMSCode(), [SMSCode])

    const reset = (e) => {
        let ok = foreignPhone && checkCountryCode() && checkPhone() && CheckPassword()
        if (!ok) ok = !foreignPhone && checkAccount() && CheckPassword()
        if (!ok) return
        checkSMSCode()
        axios.post("/api/userResetPassword", { countryCode, phone, SMSCode }).then((ret) => {
        })

    }
    return <div style={css.containerL1}>
        <div style={css.containerL2}>
            <div style={cr0}><h2> {info.Title} </h2></div>
            <div style={{ ...cr0, color: "#99a", margin: "-1em 0 1em 0", fontSize: "14px" }}>{info.Annotation}</div>

            {/*{foreignPhone && <div style={css.inputContainer} key={"input-phone-number"}>*/}
            {/*  <div style={{...css.inputContainer, margin: "0 1em 0 0"}}>{info.CountryCodeTitle + countryCode}</div>*/}
            {/*  <input type={"number"} value={countryCode} name={"countryCode"} style={{display: "none"}} readOnly>*/}
            {/*  </input>*/}

            {/*  <div>|</div>*/}

            {/*  <input type={"tel"} name={"phone"} value={!!phoneError ? phoneError : phone}*/}
            {/*         placeholder={info["PhoneNumberTitle"]}*/}
            {/*         style={{...css.input, margin: "0 0 0 0.5em", "color": inputColor(phoneError, phone)}}*/}
            {/*         onClick={e => setPhoneError("")}*/}
            {/*         onChange={e => {*/}
            {/*           setPhone(e.target.value);*/}
            {/*           setPhoneError("")*/}
            {/*         }}/>*/}
            {/*</div>*/}
            {/*}*/}

            {!foreignPhone ?
                <TextField key="forgotPassword-phone" label={info.AccountTitle} size="small"
                    variant="standard" helperText={accountError}
                    error={!!accountError} onChange={e => setAccount(e.target.value)}
                    style={{ width: "100%", }} />
                :
                <div style={{ ...cr0, }}>
                    <CountrySelect width={"250px"} disableCloseOnSelect countryCodeError={countryCodeError}
                        defaultValue={'CN'}
                        setCountryCode={setCountryCode}
                        key={`forgotPassword_CountrySelect_${foreignPhone}`}> </CountrySelect>

                    {/*填写手机号码*/}
                    <TextField key="forgotPassword-phone" label={info["PhoneNumberTitle"]} size="small"
                        helperText={phoneError}
                        variant="standard" error={!!phoneError} onChange={e => setPhone(e.target.value)}
                        style={{ width: "100%" }} />
                </div>}


            {/*密码框*/}
            <TextField key="forgotPassword-password" label={info["PasswordTitle"]} size="small" type={"password"}
                variant="standard" helperText={passwordError}
                error={!!passwordError} onChange={e => setPassword(e.target.value)}
                style={{ width: "100%" }} />


            {/*手机校验码*/}
            <div style={css.inputContainer} key={"input-SMS-code"}>
                <TextField key="forgotPassword-SMS" type="text" label={info.VerifyCodeTitle}
                    size="small" helperText={SMSCodeError} variant="standard"
                    onChange={e => setSMSCode(e.target.value)} error={!!SMSCodeError}
                    fullWidth={true}></TextField>
                <Button onClick={e => SendSMSCode(() => {
                    if (!foreignPhone) return checkAccount()
                    if (foreignPhone) return checkCountryCode() && checkPhone()
                })} style={{ width: 200 }} disabled={SMSButtonDisabled}>{SMSButtonText} </Button>
            </div>

            <Button style={cr0} key={"user_foreign_phone"} onClick={e => {
                setForeignPhone(!foreignPhone);
                setCountryCode(foreignPhone ? 1 : 86);
                if (foreignPhone) setAccount("")
                else setPhone("")
            }}>
                {!foreignPhone ? info.ForeignPhoneMode : info.MailAccountLogin}
            </Button>

            <Button variant="contained" style={css.submit} key={"login-button"}
                onClick={e => reset(e)}>{info.ResetTitle} </Button>

            <div style={{ ...cr1, margin: "2em 0 0 3em" }}>
                <div>{info.WithoutAnAccount}</div>
                <Button onClick={e => SetAuthPage(AuthPages.SignUp)}>{info.Signup}</Button>
            </div>
        </div>

        <div style={css.footer}>{info.Footer}</div>
    </div>
}