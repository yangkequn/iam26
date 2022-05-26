import { Button } from "@mui/material";
import React, { useState, useContext } from "react";
import { GlobalContext } from "../base/GlobalContext";



export function SelectBluetoothHeartrateDevice() {
    const { HeartRate, setHeartRate } = useContext(GlobalContext);

    const [stopped, setStopped] = useState<Boolean>(true);

    const handleCharacteristicValueChanged = (event: Event) => {
        let characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        let value = characteristic.value;
        setHeartRate(value.getUint8(1));
    };
    const StartRetrievHeartRateData = e => {
        stopped && navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
            .then(device => device.gatt.connect())
            .then(server => server.getPrimaryService('heart_rate'))
            .then(service => service.getCharacteristic(0x2A37))
            .then(characteristic => {
                characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
                // Reading Battery Level…
                return characteristic.startNotifications();
            })
            .catch(error => { console.error(error); });
        setStopped(!stopped);
    };

    return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "0.5em 3em 0.5em 3em" }} onClick={StartRetrievHeartRateData}>
        {!stopped ? `当前心率:${HeartRate}` : "点击选择蓝牙心率设备"}
    </Button>;
}
