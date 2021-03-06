

/// <reference types="web-bluetooth" />
import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from "./GlobalContext"
import { Button } from "@mui/material";


export interface IAcceleration { x: number | null, y: number | null, z: number | null }
let tasksend = 0
export function BlueToothHeartRate({ multiplier = 10, useGravity = false }: { multiplier?: number, useGravity?: boolean }) {
    const { HeartRate, setHeartRate } = useContext(GlobalContext)
    useEffect(() => {
        // window.addEventListener('devicemotion', handleAcceleration)
        // return () => window.removeEventListener('devicemotion', handleAcceleration)
    })
    const handleCharacteristicValueChanged = (event: Event) => {
        let characteristic = event.target as BluetoothRemoteGATTCharacteristic
        let value = characteristic.value
        let heartRate = !value ? 0 : value.getUint8(1)
        setHeartRate(heartRate)
    }

    const [stopped, setStopped] = useState<Boolean>(true)

    const StartRetrieveHeartRate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
            .then(device => {
                console.log("设备预备连接")
                if (device.gatt === undefined) return
                return device.gatt.connect()

            })
            .then(server => {
                console.log("设备已经连接")
                if (server === undefined) return
                // Getting Battery Service…
                return server.getPrimaryService('heart_rate');
            })
            .then(service => {
                console.log("getCharacteristic")
                if (service === undefined) return
                // Getting Battery Level Characteristic…
                return service.getCharacteristic(0x2A37);
            })
            .then(characteristic => {
                console.log("characteristicvaluechanged")
                if (characteristic === undefined) return
                characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
                // Reading Battery Level…
                return characteristic.startNotifications();
            })
            .catch(error => { console.error(error); });
        setStopped(false)
        //setStopped(!stopped)
    }
    return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "3em 3em 3em 3em" }} onClick={StartRetrieveHeartRate} >
        {!stopped ? `发送${tasksend} 当前心跳:${HeartRate}` : "启用蓝牙心率计"}
    </Button>

}
