import React, { useContext, useEffect, useState } from "react";
import axios from "axios";

import { Navigate, Route } from "react-router-dom";
import { AuthPanelWidth } from "./index";
import { unixTime } from "../base/Fuctions";
import { cr0, cr1, cv0, cv1 } from "../base/css";
import { GlobalContext } from "../base/GlobalContext";
import {Jwt} from "../models/Jwt"
import {JwtRequest} from "../models/Webapi"


const Avatar = ({ avatar, setAvatar, id }) => {
  const AvatarPostBinary = (e) => {
    const formData = new FormData()
    formData.append("avatar", e.target.files[0])
    JwtRequest().put("/api/userAvatar", formData).then(ret => setAvatar("/api/userAvatar?id=" + id + "&t=" + unixTime()))
  }
  return <div style={{ margin: "0 0 1em 0" }}>
    {!!avatar && <div style={cr0}>
      <div style={{ margin: "0 1em 0 0" }}>头像</div>
      <img src={avatar} alt="" /></div>}
    {<div style={{ ...cr0, justifyContent: "space-between" }}>
      <input type="file" style={{ display: "none" }} id="upload_avatar" onChange={AvatarPostBinary} />
      <button style={{ margin: "1em 0 0 0" }} onClick={e => document.getElementById("upload_avatar").click()}>
        {!!avatar ? "修改头像" : "上传头像"}
      </button>

    </div>
    }

  </div>
}
const MyProfileCss = () => {
  return ({
    background: { ...cv0, height: "100%", background: "#f7f9fb", alignItems: "center", },
    inputContainer: { ...cr0, borderBottom: "2px solid #eee", margin: "0 0 1.0em 0", },
    phonePanel: { ...cr0, justifyContent: "space-between" },
    phoneInput: { ...cr1, borderBottom: "2px solid #eee", margin: "0 0 1.0em 0", },
    form: { ...cv1, width: AuthPanelWidth, background: "#ffffff", color: "#000", padding: "3em 2em 0em 2em", },
    login_container: { ...cr1, fontSize: "14px", justifyContent: "center", color: "#000", margin: "0.7em 0 1.5em 0" },
    input: { ...cr1, outline: "none", margin: "0 0 0 0", width: "70%", border: "0px solid black", color: "#000" },
    button: { margin: "0 0 0 1em", lineHeight: 1.0, border: "0px", width: "120px", background: "#FFFFFF" },
    submit: {
      ...cr0, border: "0px", fontSize: "14px", height: "36px", background: "#0066ff",
      justifyContent: "center", color: "#ffffff", borderRadius: "4px", alignItems: "center"
    },
    footer: { ...cr0, margin: "2em 0 2em 0", fontSize: "14px", justifyContent: "center", borderRadius: "4px", },
    inputColor: (error, input) => {
      if (!!error) return "#f1403c"
      if (!!input) return "#000"
      return "#89a"
    },
  })
}

const MyProfileMenuTitle = (language_ind) => {
  const info_languages = {
    Title: ["Complete my profile", "完善我的资料"][language_ind],
    footer: ["Every thing you pursuit, there's an answer", "你总在乎的，终有答案"][language_ind],
    save: ["Save modification", "保存修改"][language_ind],
    channelName: ["My channel name:", "呢称："][language_ind],
    noChannelName: ["Write channel name here", "缺失，在这里添加.."][language_ind],
    noChannelNameError: ["Channel name incomplete", "未填写频道名称.."][language_ind],
    loginAccount: ["Login Account:", "登录账号："][language_ind],
    noLoginAccount: ["Write real name here", "缺失，在这里填写.."][language_ind],

  }
  return info_languages
}
export const MyProfile = () => {
  const css = MyProfileCss()
  const info = MyProfileMenuTitle(1)

  const { LoggedIn } = useContext(GlobalContext)
  const [countryCode, setCountryCode] = useState("")
  const [phone, setPhone] = useState("")
  const [channelName, setChannelName] = useState("")
  const [channelNameError, setChannelNameError] = useState("")
  const [loginAccount, setLoginAccount] = useState("")
  const [buttonAlert, setButtonAlert] = useState("")
  const [avatar, setAvatar] = useState(null)
  const SaveProfile = (e) => {
    if (!channelName) setChannelNameError(info.noChannelNameError);

    if (!!channelName && !!loginAccount && LoggedIn && Jwt.Get().jwt) {
      let param = new URLSearchParams({ channelName, loginAccount })
      axios.create({ headers: { "Authorization": Jwt.Get().jwt } }).put("/api/userProfile", param).then(ret => {
        //提示修改结果
        if (ret.data.Error === "") {
          setButtonAlert("已修改")
          setTimeout(() => setButtonAlert(""), 2000)
        }
      })
    }
  }
  useEffect(() => {
    if (!!Jwt.Get().jwt && LoggedIn) axios.create({ headers: { "Authorization": Jwt.Get().jwt } }).get("/api/userProfile").then(ret => {
      let data = ret.data;
      setCountryCode(data["countryCode"])
      setPhone(data["phone"])
      setChannelName(data["channelName"])
      setLoginAccount(data["loginAccount"])
      setAvatar(data["avatar"])
    })
  }, [LoggedIn])


  return !LoggedIn ? <Route element={()=><Navigate to={"/Login"}></Navigate>} /> :
    <div key={`MyProfile${LoggedIn}` } style={css.background} >

      <div style={css.form}>
        <div><h2> {info["Title"]} </h2></div>

        <div style={css.phonePanel}>
          <div style={css.phoneInput} key={"input-phone-number"}>
            <div>手机号：</div>
            <div>{countryCode}</div>
            <div style={{ margin: "0 1em 0 1em" }}>|</div>
            <div>{phone}</div>
          </div>
          {!!phone && <div style={{ margin: "0 0 0 1em ", border: "1px", nowrap: "true" }}>已经认证</div>}
        </div>

        {/*<div style={css.inputContainer} key={"input-real-name"}>*/}
        {/*  <div>{info.loginAccount}</div>*/}
        {/*  <input placeholder={info.noLoginAccount} value={loginAccountError || loginAccount}*/}
        {/*         style={{...css.input, "color": css.inputColor(loginAccountError, loginAccount)}}*/}
        {/*         onChange={e => setLoginAccount(e.target.value)} onClick={e => setLoginAccountError("")}/>*/}
        {/*</div>*/}


        <div style={css.inputContainer} key={"input-channel-name"}>
          <div>{info.channelName}</div>
          <input placeholder={info.noChannelName} value={channelNameError || channelName}
            style={{ ...css.input, "color": css.inputColor(channelNameError, channelName) }}
            onChange={e => setChannelName(e.target.value)} onClick={e => setChannelNameError("")} />
        </div>

        <Avatar avatar={avatar || "/api/userAvatar?id=" + Jwt.Get().id} setAvatar={setAvatar} key={Jwt.Get().id} />

        <button style={css.submit} key={"sign-up-button"} onClick={e => SaveProfile(e)}
          disabled={!!buttonAlert}> {buttonAlert || info.save} </button>
      </div>

      <div style={css.footer}>{info.footer}</div>
    </div>

}