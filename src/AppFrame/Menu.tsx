import axios from "axios"
import React from "react"
import { useContext } from "react"
import { AuthPages } from "../Auth"
import { GlobalContext } from "../base/GlobalContext"
import { Menu, MenuItem } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Jwt } from "../models/Jwt"

export class MenuStruct {
  constructor(public name: string, public path: string, public icon: string | null, public subMenu: Array<MenuStruct> ) { }
  public isCurrentPath = (): boolean => {
    if (this.path.toLowerCase() === window.location.pathname.toLowerCase()) return true
    // if no submenu, return false
    if (!this.subMenu) return false
    // foreach submenu, if any of them is current path, return true
    for (let item of this.subMenu) {
      if (item.isCurrentPath()) return true
    }
    return false
  }

  public Variant = (): string => this.isCurrentPath() ? "contained" : "text"
}

const home = new MenuStruct("iam26", "/", null, [
  new MenuStruct("关于健康那些最重要的事情 / on Health made of", "/TodoListOnHealth", null, []),
])
const sleep = new MenuStruct("开始睡觉", "/Sleep/Start", null, [
  new MenuStruct("AI强化睡眠", "/Sleep/Start", null, []),
  new MenuStruct("检查清单", "/Sleep/Checklist", null,[]),
  //new MenuStruct("选择设备", "/Sleep/Device", null,[]),
])
const _me = new MenuStruct("开始", "/MyTrace", null, [
  new MenuStruct("我的追踪", "/MyTrace", null,[]),
  new MenuStruct("集体调研区", "/MyTrace/similar", null,[]),
  new MenuStruct("来自AI的今日建议", "/MyTrace/hiFriend", null,[]),
  new MenuStruct("添加微信群", "/MyTrace/feedback", null,[]),
])
const goals = new MenuStruct("修改目标", "/Goals", null, [
  new MenuStruct("我的目标", "/Goals/Mine", null,[]),
  new MenuStruct("添加 / 创建", "/Goals", null,[]),
])
const _goals = new MenuStruct("修改目标", "/Goals", null, [
  new MenuStruct("我的目标", "/Goals/Mine", null,[]),
  new MenuStruct("添加 / 创建", "/Goals", null,[]),
])
const methods = new MenuStruct("措施", "/Act", null, [
  new MenuStruct("我常用", "/Act/Mine", null,[]),
  new MenuStruct("全部列表", "/Act", null,[]),
])
const measure = new MenuStruct("评估", "/Measure", null, [
  new MenuStruct("我常用", "/Measure/Mine", null,[]),
  new MenuStruct("全部列表", "/Measure", null,[]),
])

//活动是后面的核心发展方向，如小区上门体检等
// const activity = {
//   ...MenuItem("活动", "/activity"),
//   subMenu: []
// }
export const MenuItems: Array<MenuStruct> = [home, sleep, _me]


type handleCloseFunction = (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;

export const MenuPopup = ({ anchorEl, handleClose }:{anchorEl:any,handleClose:handleCloseFunction}) => {
  const { SetAuthPage, LoggedIn } = useContext(GlobalContext)
  const popupAuthPage = (page :string, e:React.SyntheticEvent) => {
    SetAuthPage(page); 
    e.preventDefault();
    e.stopPropagation();
    handleClose(e,e.type==="KeyboardEvent"?"escapeKeyDown":"backdropClick");
  }
  const popupLoginPage =( e:React.SyntheticEvent) => popupAuthPage(AuthPages.Login, e);
  const popupMyProfile = ( e:React.SyntheticEvent) => popupAuthPage(AuthPages.MyProfile, e);
  const signIn =( e:React.SyntheticEvent)=> popupAuthPage(AuthPages.Login, e);
  const signUp =( e:React.SyntheticEvent)=> popupAuthPage(AuthPages.SignUp, e);
  const signout =( e:React.SyntheticEvent)=> axios.get("/api/userSignOut").then(ret => Jwt.UpdateJWT(true));
  return <Menu id="MenuPopup" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose} key={`Menu_${LoggedIn}`}>
    <MenuItem sx={{ display: LoggedIn && !!Jwt.Get().temporaryAccount ? "block" : "none" }} onClick={popupLoginPage}>
      <ErrorOutlineIcon sx={{ color: "yellowgreen" }} />  临时账号，暂存两月
    </MenuItem>
    <MenuItem sx={{ display: LoggedIn && !!Jwt.Get().temporaryAccount ? "block" : "none" }} onClick={signUp}>及时来不？注册 ..</MenuItem>
    <MenuItem sx={{ display: LoggedIn && !!Jwt.Get().temporaryAccount ? "block" : "none" }} onClick={signIn}>及时来不？登录 ..</MenuItem>
    <MenuItem sx={{ display: LoggedIn && !Jwt.Get().temporaryAccount ? "block" : "none" }} onClick={popupMyProfile}>个人信息</MenuItem>
    <MenuItem sx={{ display: LoggedIn && !Jwt.Get().temporaryAccount ? "block" : "none" }} onClick={signout}  >退出登录</MenuItem>
    <MenuItem onClick={signIn} sx={{ display: !LoggedIn ? "block" : "none" }}>登录</MenuItem>

    {/* <MenuItem onClick={e=>setRedirectUrl("/Results")}  >搜索结果</MenuItem> */}

  </Menu>
}

