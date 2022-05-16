import React, {useState} from "react";
import axios from "axios";
import { User } from "../models/user";

export const AuthContext = React.createContext(null)
export const AuthContextComponent = ({children}) => {
    const [nickname, setNickname] = useState("")
    const [nicknameError, setNicknameError] = useState("")
    const CheckNickName = () => {
        let e = ""
        if (!nickname) e = "昵称不能为空"
        else {
            let l = nickname.length;
            if (l > 32 || l < 5) e = "昵称 5-32字符"
        }
        setNicknameError(e)
        return !e
    }


    const [countryCode, setCountryCode] = useState("86")
    const [countryCodeError, setCountryCodeError] = useState("")
    const checkCountryCode = () => {
        let e = "";
        if (!countryCode || isNaN(countryCode)) e = "无效国家，重新选择"
        setCountryCodeError(e)
        return !e
    }


    const [phone, setPhone] = useState("")
    const [phoneError, setPhoneError] = useState("")
    const checkPhone = () => {
        let e = "";
        if (!phone) e = "常用手机号必填"
        if (!(phone.length >= 7 && phone.length <= 13)) e = "手机号码7-13位"
        else if (!phone.match(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im))
            e = "不是完整有效手机号码"
        setPhoneError(e);
        if (!e) checkCountryCode() && User.CheckAccountOccupied(countryCode + "|" + phone, setPhoneError)
        return !e
    }

    const [SMSCode, setSMSCode] = useState(null)
    const [SMSCodeError, setSMSCodeError] = useState(null)
    const checkSMSCode = () => {
        let e = "";
        if (SMSCode === "none") e = "请填写校验码"
        else if (SMSCode.length !== 6) e = "校验码为六位"
        setSMSCodeError(e);
        return !e
    }
    const [SMSButtonText, setSMSButtonText] = useState("获取校验码")
    const [SMSButtonDisabled, setSMSButtonDisabled] = useState(false)

    const ModifySMSButtonText = (i) => {
        if (i > 0) {
            setSMSButtonText("已发送, " + i + " ...")
            setTimeout(() => ModifySMSButtonText(i - 1), 1000)
            setSMSButtonDisabled(true)
        } else {
            setSMSButtonText("重新获取");
            setSMSButtonDisabled(false)
        }
    }
    const SendSMSCode = (check) => {
        let ok = check(); 
        if (!ok) return
        //to do 开发测试代码，上线前修改
        ModifySMSButtonText(60)
        if (ok) axios.post("/api/userSentSMS", {countryCode, phone}).then(r => {
            if (!!r.data.error && r.data.error === "phone") setPhoneError("该手机已经注册")
        })
    }


    const [account, setAccount] = useState("")
    const [accountError, setAccountError] = useState("")
    const checkAccount = (checkExistance = true) => {
        let e = "";
        if (!account) e = "账号必须填写"
        if (account.length < 6 || account.length > 32) e = "账号6-32位"
        setAccountError(e);
        if (!e && checkExistance) User.CheckAccountOccupied(account, setAccountError)
        return !e
    }


    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const CheckPassword = () => {
        let e = "";
        if (!password) e = "密码必须填写"
        if (password.length < 8 || password.length > 32) e = "密码8-32位"
        setPasswordError(e);
        return !e
    }
    const [foreignPhone, setForeignPhone] = useState(false)

    const store = {
        nickname: [nickname, setNickname, nicknameError],
        countryCode: [countryCode, setCountryCode, countryCodeError],
        phone: [phone, setPhone, phoneError, setPhoneError],
        account: [account, setAccount, accountError, setAccountError],
        password: [password, setPassword, passwordError,],
        foreignPhone: [foreignPhone, setForeignPhone],
        SMSCode: [SMSCode, setSMSCode, SMSCodeError, setSMSCodeError, SMSButtonText, SMSButtonDisabled],
        SendSMSCode, checkSMSCode, CheckPassword, checkAccount, checkPhone, checkCountryCode,
         CheckNickName
    }

    return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>
}
