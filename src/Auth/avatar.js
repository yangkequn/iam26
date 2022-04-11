import React, {  useEffect, useState } from "react";
import { Avatar, Tooltip } from "@mui/material";
import { IsASCII } from "../base/Fuctions";
import { User } from "../models/user";

export const UserAvatar = ({ userID, style }) => {
    const avatarText = (name) => {
        if (!name || name.length === 0) return ""
        if (name.length > 3) name = name.substring(0, 3)
        setName(IsASCII(name) ? name : name[0])
    }
    const [name, setName] = useState("")

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => User.GetUserName(userID,avatarText), [ userID])

    return !userID?<div/>:<Tooltip title={name} placement="left">
        <Avatar src={User.avatarUrl(userID)} style={style} alt={name} />
    </Tooltip>
} 