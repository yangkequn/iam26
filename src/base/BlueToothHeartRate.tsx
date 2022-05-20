
/// <reference types="web-bluetooth" />
import React, { useState, useEffect, useContext } from 'react';
import { MeasureAccelerometer } from "../models/MeasureAccelerometer"
import { GlobalContext } from "./GlobalContext"
import { Box } from '@mui/system';
import { Button } from "@mui/material";


export interface IAcceleration { x: number | null, y: number | null, z: number | null }
let DataAcceleration: number[] = []
let factor = -1
const SecondsWanted = 6
let tasksend = 0
export function BlueToothHeartRate({ multiplier = 10, useGravity = false }: { multiplier?: number, useGravity?: boolean }) {
    const { Heartbeat, setHeartbeat } = useContext(GlobalContext)
    useEffect(() => {
        // window.addEventListener('devicemotion', handleAcceleration)
        // return () => window.removeEventListener('devicemotion', handleAcceleration)
    })
    const SaveDataAndRestartRecording = () => {
        let model = new MeasureAccelerometer("0", DataAcceleration, [])
        DataAcceleration = []
        return model
    }
    const handleCharacteristicValueChanged = (event: Event) => {
        let characteristic = event.target as BluetoothRemoteGATTCharacteristic
        let value = characteristic.value
        setHeartbeat(value.getInt8(1))
    }
    const saveToHistory = (acceleration: IAcceleration) => {
        if (stopped) {
            if (DataAcceleration.length > 0) DataAcceleration = []
            tasksend = 0
            return
        }
        //采用高精度的时间戳，chrome测试精确到0.1ms
        var now = performance.timing.fetchStart + (performance.now() << 0)
        if (DataAcceleration.length === 0) {
            //起始时间
            DataAcceleration.push(now)
            //结束时间
            DataAcceleration.push(0)
            //number
            DataAcceleration.push(0)
        }
        if (factor === -1) {
            if ((acceleration.x * 10.) << 0 === acceleration.x * 10 && (acceleration.y * 10.) << 0 === acceleration.y * 10 && (acceleration.z * 10.) << 0 === acceleration.z * 10) {
                factor = 10
            } else {
                factor = 100
            }
        }
        DataAcceleration.push((acceleration.x * factor) << 0)
        DataAcceleration.push((acceleration.y * factor) << 0)
        DataAcceleration.push((acceleration.z * factor) << 0)

        //ensure  timespan cal be calculated
        if (DataAcceleration.length < 20) return

        //should monitor at least 3 seconds data points
        if (now - DataAcceleration[0] < SecondsWanted * 1000) return

        // data point of each seconds should more than 40 points
        let dataDensity = DataAcceleration.length / SecondsWanted / 3
        let DataIntegrity = DataAcceleration.length % 3 === 0
        setLenPerSecond(dataDensity)
        if (dataDensity < 40 || !DataIntegrity) {
            //alert("数据密度不足，采样失败，请更换设备")
            SaveDataAndRestartRecording()
            return
        }
        DataAcceleration[1] = now
        DataAcceleration[2] = DataAcceleration.length
        //压缩时间，第一个值是绝对时间戳，后续是毫秒计数的时间流逝值
        let model = SaveDataAndRestartRecording()
        //数据点密度太高，则压缩减半，把两个点压缩为一个点
        while ((model.data.length / SecondsWanted / 3) > 350) {
            //把每两个加速度合并为一个加速度
            let je = 3 + 6 * (((model.data.length - 3) / 6) << 0);
            let cnt = 0;
            for (let j = 3; j < je; cnt += 1, j += 6) {
                model.data[cnt * 3 + 3] = Math.round((model.data[j] + model.data[j + 3]) / 2)
                model.data[cnt * 3 + 4] = Math.round((model.data[j + 1] + model.data[j + 4]) / 2)
                model.data[cnt * 3 + 5] = Math.round((model.data[j + 2] + model.data[j + 5]) / 2)
            }
            //如果剩一点单点数据，那么单独保存
            if (je !== model.data.length) {
                model.data[cnt * 3 + 3] = model.data[je]
                model.data[cnt * 3 + 4] = model.data[je + 1]
                model.data[cnt * 3 + 5] = model.data[je + 2]
                cnt += 1
            }

            //删除缩减后的数据
            model.data.splice(cnt * 3 + 3, model.data.length - (cnt * 3 + 3))
            //重写个数
            model.data[2] = model.data.length
        }
        tasksend += 1
        //save to server
        model.Put(StartHeartBeatEvent)
    }
    const StartHeartBeatEvent = (v) => setHeartbeat(v.heartbeat);
    const handleAcceleration = (event) => {
        var acceleration = useGravity ? event.accelerationIncludingGravity : event.acceleration

        saveToHistory(acceleration as IAcceleration)
    }
    const [lenPerSecond, setLenPerSecond] = useState(0)

    const [stopped, setStopped] = useState<Boolean>(true)

    const StartRetrieveHeartBeat = e => {
        navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
            .then(device => {
                console.log("设备预备连接")
                return device.gatt.connect()

            })
            .then(server => {
                console.log("设备已经连接")
                // Getting Battery Service…
                return server.getPrimaryService('heart_rate');
            })
            .then(service => {
                console.log("getCharacteristic")
                // Getting Battery Level Characteristic…
                return service.getCharacteristic(0x2A37);
            })
            .then(characteristic => {
                console.log("characteristicvaluechanged")
                characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
                // Reading Battery Level…
                return characteristic.startNotifications();
            })
            .catch(error => { console.error(error); });
        setStopped(false)
        //setStopped(!stopped)
    }
    return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "3em 3em 3em 3em" }} onClick={StartRetrieveHeartBeat} >
        {!stopped ? `发送${tasksend}每秒采样点:${lenPerSecond.toPrecision(3)} 当前心跳:${Heartbeat}` : "启用蓝牙心率计"}
    </Button>

}
