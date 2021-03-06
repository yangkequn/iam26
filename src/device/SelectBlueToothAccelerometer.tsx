import { Button } from "@mui/material";
import React, { useState, useContext } from "react";
import { unixTime } from "../base/Fuctions";
import { GlobalContext } from "../base/GlobalContext";

export function SelectBlueToothAccelerometer() {
    const { AcceleroData, setAcceleroData } = useContext(GlobalContext)

    const [stopped, setStopped] = useState<Boolean>(true)
    const [cntLast, setCntLast] = useState<number>(0)
    const [packNum, setPackNum] = useState<number>(0)
    let sec = unixTime();
    let cnt = 0;
    const handleCharacteristicValueChanged = (event: Event) => {
        let characteristic = event.target as BluetoothRemoteGATTCharacteristic
        if (!characteristic.value) return
        let value = characteristic.value

        const c = 16.0 * 9.8 / 32768.0
        let acceleroData = [] as number[]
        for (var i = 0; i < value.byteLength; i += 20) {
            var acceleroX = c * value.getInt16(i + 2, true);
            var acceleroY = c * value.getInt16(i + 4, true);
            var acceleroZ = c * value.getInt16(i + 6, true);
            acceleroData.push(acceleroX, acceleroY, acceleroZ)
        }
        setAcceleroData(acceleroData)
        if (sec === unixTime()) {
            let packNum = characteristic.value.byteLength / 20;
            setPackNum(packNum)
            cnt += 1
        } else {
            setCntLast(cnt)
            cnt = 0;
            sec = unixTime();
        }
    }
    const StartRetrievHeartRateData = (e: any) => {
        stopped && navigator.bluetooth.requestDevice({ filters: [{ services: ['0000ffe5-0000-1000-8000-00805f9a34fb'] }, { namePrefix: 'WT' }] })
            .then(device => !device.gatt ? null : device.gatt.connect())
            .then(server => !server ? null : server.getPrimaryService('0000ffe5-0000-1000-8000-00805f9a34fb'))
            .then(service => !service ? null : service.getCharacteristic('0000ffe4-0000-1000-8000-00805f9a34fb'))
            .then(characteristic => {
                if(!characteristic) return
                characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
                // Reading Battery Level???
                return characteristic.startNotifications();
            })
            .catch(error => { console.error(error); });
        setStopped(!stopped)
    }

    return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "0.5em 3em 0.5em 3em" }} onClick={StartRetrievHeartRateData} >
        {!stopped ? `?????????????????????:${cntLast}?????????${packNum}?????????` : "????????????????????????"}
    </Button>
}