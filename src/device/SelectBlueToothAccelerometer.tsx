import { Button } from "@mui/material";
import React, { useState, useContext } from "react";
import { unixTime } from "../base/Fuctions";
import { GlobalContext } from "../base/GlobalContext";


let displayed = false
export function SelectBlueToothAccelerometer() {
    const { HeartRate, setHeartRate } = useContext(GlobalContext)
    const [stopped, setStopped] = useState<Boolean>(true)
    const [cntLast, setCntLast] = useState<number>(0)
    const [packNum, setPackNum] = useState<number>(0)
    let sec = unixTime();
    let cnt = 0;
    const handleCharacteristicValueChanged = (event: Event) => {
        let characteristic = event.target as BluetoothRemoteGATTCharacteristic
        let value = characteristic.value
        const c = 16.0 * 9.8 * 1000 / 32768.0
        var acceleroX = c * value.getInt16(2, true);
        var acceleroY = c * value.getInt16(4, true);
        var acceleroZ = c * value.getInt16(6, true);
        var sr = 0
        sr = Math.sqrt(acceleroX * acceleroX + acceleroY * acceleroY + acceleroZ * acceleroZ)
        if (cnt === 0) console.log("acceleroX", acceleroX, "acceleroY", acceleroY, "acceleroZ", acceleroZ, "|a|", sr)

        if (sec === unixTime()) {
            let packNum = characteristic.value.byteLength / 20;
            setPackNum(packNum)
            cnt += 1
        } else {
            setCntLast(cnt)
            cnt = 0;
            sec = unixTime();
        }
        if (!displayed) {
            console.log("acceleroX", acceleroX, "acceleroY", acceleroY, "acceleroZ", acceleroZ, "|a|", sr, "characteristic.value", characteristic.value.buffer)
            displayed = true
        }
    }
    const StartRetrievHeartRateData = e => {
        stopped && navigator.bluetooth.requestDevice({ filters: [{ services: ['0000ffe5-0000-1000-8000-00805f9a34fb'] }, { namePrefix: 'WT' }] })
            .then(device => device.gatt.connect())
            .then(server => server.getPrimaryService('0000ffe5-0000-1000-8000-00805f9a34fb'))
            .then(service => service.getCharacteristic('0000ffe4-0000-1000-8000-00805f9a34fb'))
            .then(characteristic => {
                characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
                // Reading Battery Level…
                return characteristic.startNotifications();
            })
            .catch(error => { console.error(error); });
        setStopped(!stopped)
    }

    return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "0.5em 3em 0.5em 3em" }} onClick={StartRetrievHeartRateData} >
        {!stopped ? `加速度传感器已经连接,每秒通信:${cntLast} packNum ${packNum}` : "点击选择蓝牙加速度计"}
    </Button>
}