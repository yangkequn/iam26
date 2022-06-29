import React, { useContext, useEffect, useState } from 'react';
import { cv0 } from '../base/css';
import { MenuItems, MenuPopup } from './Menu';
import { GlobalContext } from '../base/GlobalContext';
import { AuthPages, AuthPopper } from '../Auth';
import { UserAvatar } from '../Auth/avatar';
import { Jwt } from '../models/Jwt';
import {Container,  Button} from "@mui/material";


export const Navigator = () => {
  const [SubMenuItems, setSubMenuItems] = useState([])

  const [anchorEl, setAnchorEl] = useState(null)
  const { LoggedIn, SetAuthPage, setRedirectUrl } = useContext(GlobalContext)

  const selectMenuL1 = menu => {
    setRedirectUrl(menu.path)
    console.log("menu.path",menu.path)
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

  const L1MenuItemCss = { color: "#fff", height: "100%", fontSize: 18, borderRadius: 0 ,ml:"-0.39em",mr:"-0.39em"}
  return <div style={{ ...cv0 }} id="appnavigator">
    <div className="App-Nagivator-l1" >
      {/* <div style={{ width: 190, height: 0, margin: "0em 0 0 0", alignSelf: "flex-start" }} >
        <Link to={"/"} >
          <Logo4 />
        </Link>
      </div> */}
      <Container >
        {MenuItems.map((item, index) => <Button key={`menu_${item.name}`} variant={item.Variant()} sx={L1MenuItemCss} size="large"
          onClick={(e) => selectMenuL1(item)}>
          {item.name}</Button>)}

        {/* login Button or user avatar */}
        {!LoggedIn && <Button sx={L1MenuItemCss} size="small" variant={"text"} onClick={()=> SetAuthPage(AuthPages.Login)}> 登录</Button>}
        {/* display avatar if logged in */}
        {LoggedIn && <Button sx={L1MenuItemCss} size="small" variant={"text"} onClick={e => setAnchorEl(e.target)}>
          <UserAvatar userID={Jwt.Get().id} style={{ height: 32, width: 32, fontSize: 18 }} />
        </Button>}

        <MenuPopup anchorEl={anchorEl} handleClose={e => setAnchorEl(null)} />
        <AuthPopper />

      </Container >
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