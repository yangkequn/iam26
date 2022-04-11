import React, { useContext, useEffect, useState } from 'react';
import { cv0 } from '../base/css';
import { MenuItems, MenuPopup } from './Menu';
import { Button } from "@mui/material";
import { GlobalContext } from '../base/GlobalContext';
import { Link } from "react-router-dom";
import { AuthPages, AuthPopper } from '../Auth';
import { UserAvatar } from '../Auth/avatar';
import { ReactComponent as Logo4 } from './Logo.svg';
import { Jwt } from '../models/Jwt';


export const Navigator = () => {
  const [SubMenuItems, setSubMenuItems] = useState([])

  const [anchorEl, setAnchorEl] = useState(null)
  const { LoggedIn, SetAuthPage, setRedirectUrl } = useContext(GlobalContext)

  const selectMenuL1 = menu => {
    setRedirectUrl(menu.path)
    setSubMenuItems(menu.subMenu)
  }
  const sekectMenuL2 = menu => {
    setRedirectUrl(menu.path)
  }
  useEffect(() => {
    //choose the item in menu that isCurrentPath
    let currentMenu = MenuItems.find(item => item.isCurrentPath())
    setSubMenuItems(currentMenu.subMenu)
  }, [])

  const L1MenuItemCss = { color: "#fff", height: "100%", fontSize: 18, margin: "0 0.2em 0 0.2em", borderRadius: 0 }
  return <div style={{ ...cv0 }} id="appnavigator">

    <div className="App-Nagivator-l1" >
      <div style={{ width: 190, height: 0, margin: "0em 0 0 0", alignSelf: "flex-start" }} >
        <Link to={"/"} >
          {/* <Logo3 /> */}
          <Logo4 />
        </Link>
      </div>
      <div style={{ alignSelf: "center", margin: "0 0 0 0.5em", height: "100%" }}>
        {MenuItems.map((item, index) => <Button key={`menu_${item.name}`} variant={item.Variant()} sx={L1MenuItemCss} size="large"
          onClick={e => selectMenuL1(item)}>
          {item.name}</Button>)}

        {/* login Button or user avatar */}
        {!LoggedIn && <Button sx={L1MenuItemCss} size="large" variant={"text"} onClick={e => SetAuthPage(AuthPages.Login)}> 登录</Button>}
        {/* display avatar if logged in */}
        {LoggedIn && <Button sx={L1MenuItemCss} size="large" variant={"text"} onClick={e => setAnchorEl(e.target)}>
          <UserAvatar userID={Jwt.Get().id} style={{ height: 32, width: 32, fontSize: 18 }} />
        </Button>}

        <MenuPopup anchorEl={anchorEl} handleClose={e => setAnchorEl(null)} />
        {<AuthPopper />}

      </div >

    </div>

    {/* layer 2 menu */}
    <div className="App-Nagivator-l2">
      {
        SubMenuItems.map(
          (item, index) => <Button key={`menu_${item.name}`} variant={item.Variant()} size="small" onClick={e => sekectMenuL2(item)}
            sx={{ height: "95%", width: "100%", fontSize: 16, backgroundColor: item.isCurrentPath() ? "#007E9B" : "#FFF", color: "black", borderRadius: 0 }}>
            {item.name}
          </Button>)
      }
    </div>

  </div >

}