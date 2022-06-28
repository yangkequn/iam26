import { Button } from "@mui/material";
import React, { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../base/GlobalContext";



export function SelectLocalAccelerometer({ multiplier = 10, useGravity = false }: { multiplier?: number; useGravity?: boolean; }) {
    const { AcceleroData, setAcceleroData } = useContext(GlobalContext);
    useEffect(() => {
        return () => window.removeEventListener('devicemotion', handleAcceleration);
    });
    const [stopped, setStopped] = useState<Boolean>(true);
    const handleAcceleration = (event: any) => {
        if (stopped)
            return;
        var acceleration = useGravity ? event.accelerationIncludingGravity : event.acceleration;
        setAcceleroData([acceleration.x, acceleration.y, acceleration.z]);
    };
    const ButtonClicked = (event: Event) => {
        if (stopped)
            window.addEventListener('devicemotion', handleAcceleration);

        else
            window.removeEventListener('devicemotion', handleAcceleration);
        setStopped(!stopped);
    };
    return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "0.5em 3em 0.5em 3em" }} onClick={e => setStopped(!stopped)}>
        {!stopped ? `已经启用本机加速度计` : "点击使用本机加速度计"}
    </Button>
}
