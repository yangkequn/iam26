import { Button } from "@mui/material";
import React, { useState, useContext } from "react";
import { GlobalContext } from "../base/GlobalContext";


let _device: any = null;

// function linearBackoff(max: number, delay: number, toTry: Function) {
//     toTry()
//         .then((result:any) => console.info('> Bluetooth Device connected.'))
//         .catch(() => {
//             setTimeout(() => linearBackoff(--max, delay, toTry), delay * 1000);
//         });
// }
export function SelectBluetoothHeartrateDevice() {
    const { HeartRate, setHeartRate } = useContext(GlobalContext);

    const [stopped, setStopped] = useState<Boolean>(true);


    function linearBackoff(max: number, delay: number, toTry: Function) {
        toTry(_device, (err: any) => {
            setTimeout(() => linearBackoff(--max, delay, toTry), delay * 1000);
        })
    }

    const handleCharacteristicValueChanged = (event: Event) => {
        let characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        let value = characteristic.value;
        if (value === null) return;
        setHeartRate(!value ? 0 : value.getUint8(1));
        console.info("heartreateis", !value ? 0 : value.getUint8(1));
    };
    function TryConnect(device: any, catchFunction: Function | null = null) {
        !!device && device.gatt.connect().then((server: any) => {
            console.info('> Bluetooth Device connected.', server)
            return !server ? null : server.getPrimaryService('heart_rate')
        }).then((service: any) => {
            console.info('> service connected.', service)
            return !service ? null : service.getCharacteristic(0x2A37)
        }).then((characteristic: any) => {
            if (!characteristic) return
            console.info('> characteristic connected.')
            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
            // Reading Battery Level…
            return characteristic.startNotifications();
        }).catch((error: any) => !!catchFunction && catchFunction(error))
    }
    const onDisconnected = (event: Event) => {
        linearBackoff(10000, 5, TryConnect);
    }
    const StartRetrievHeartRateData = (e: React.MouseEvent) => {
        stopped && navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
            .then(device => {
                _device = device;
                device.addEventListener('gattserverdisconnected', onDisconnected);
                TryConnect(device)
            })
        setStopped(!stopped);
    };

    return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "0.5em 3em 0.5em 3em" }} onClick={StartRetrievHeartRateData}>
        {!stopped ? `当前心率:${HeartRate}` : "点击选择蓝牙心率设备"}
    </Button>;
}
