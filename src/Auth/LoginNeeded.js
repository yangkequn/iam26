import React, {useContext} from "react";
import {GlobalContext} from "../globalContext";
import {  cv0} from "../library/base";
import {Button} from "@mui/material";
import {AuthPages} from "./index";

export const LoginNeeded = ({hint, children,skipLoginCheck=false}) => {

    const {LoggedIn, SetAuthPage, } = useContext(GlobalContext)

    return !LoggedIn&&!skipLoginCheck ? <div style={{...cv0, justifyContent: "center", alignItems: "center"}}>
        <div style={{margin: "5em 0 1em 0"}}> {hint}</div>
        <Button onClick={e => SetAuthPage(AuthPages.Login)}>登录</Button>
    </div> : children

}