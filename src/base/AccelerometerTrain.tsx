/// <reference types="web-bluetooth" />
import React, { useState, useEffect } from 'react';
import { MeasureAccelerometerTraining } from "../models/MeasureAccelerometerTraining"
import { Button } from "@mui/material";

//calculate mean squre root error
const MSRE = (data: number[]) => {
  let sum = data.reduce((a, b) => a + b, 0) / data.length
  let squareSum = data.reduce((a, b) => a + (b - sum) * (b - sum), 0) / data.length
  return Math.sqrt(squareSum)
}

export interface IAcceleration { x: number | null, y: number | null, z: number | null }
let dataX: Array<number> = []; let dataY: Array<number> = []; let dataZ: Array<number> = []; let heartrate: Array<number> = [];
//let DataAcceleration: number[] = []
let factor = -1, startTM = 0, endTM = 0
const SecondsWanted = 18
let tasksend = 0
const SaveDataAndRestartRecording = (): MeasureAccelerometerTraining | null => {
  const reset = () => {
    dataX = []; dataY = []; dataZ = []; heartrate = [];
    return null
  }
  //手机离身或者心率变化很小，数据冗余无意义
  var msex = MSRE(dataX), msey = MSRE(dataY), msez = MSRE(dataZ), msehr = MSRE(heartrate)
  if (msex < 0.01 * factor || msey < 0.01 * factor || msez < 0.01 * factor || msehr < 0.1) {
    //alert("msex" + msex + "msey" + msey + "msez" + msez + "msehr" + msehr)
    return reset()
  }

  var dataToCompress = [dataX, dataY, dataZ, heartrate];
  //数据点密度太高，则压缩减半，把两个点压缩为一个点
  dataToCompress.forEach((data) => {
    while ((data.length / SecondsWanted) > 350) {
      //把每两个加速度合并为一个加速度
      for (let j = 0, je = (data.length >> 1) << 1; j < je; j += 2)  data[j >> 1] = Math.round((data[j] + data[j + 1]) / 2)
      //如果剩一点单点数据，那么单独保存
      if (data.length & 1) data[data.length >> 1] = data[data.length - 1]
      //删除缩减后的数据
      var cnt = (data.length + 1) >> 1
      data.splice(cnt, data.length - cnt)
    }
  })
  //压缩数据,相同的数据只保留一个分隔符
  dataToCompress.forEach(data => { for (var i = data.length - 1; i >= 1; i--) if (data[i] === data[i - 1]) data[i] = null })

  var data = [startTM, endTM, 4, dataX.length].concat(dataX).concat(dataY).concat(dataZ).concat(heartrate)
  reset()
  return new MeasureAccelerometerTraining("0", encodeAcceleroString(data.join(",")), []);
}
function encodeAcceleroString(s: string): string {
  var r = []
  for (var i = 0; i < s.length; i++) {
    if (s[i] !== ",") {
      r.push(s[i])
      continue
    }
    var j = i + 1; while (j < s.length && s[j] === "," && (j - i) < 10000) j++;
    var l = j - i;
    if (l === 1) r.push(","); else if (l < 10) r.push("v" + l); else if (l < 100) r.push("w" + l); else if (l < 1000) r.push("x" + l); else if (l < 10000) r.push("y" + l);
    i = j - 1
  }
  return r.join("")
}
export function AccelerometerTrain({ multiplier = 10, useGravity = false }: { multiplier?: number, useGravity?: boolean }) {
  const [HeartRate, setHeartRate] = useState<number>(0)
  useEffect(() => {
    window.addEventListener('devicemotion', handleAcceleration)
    return () => window.removeEventListener('devicemotion', handleAcceleration)
  })
  const saveToHistory = (acceleration: IAcceleration) => {
    if (stopped || HeartRate === 0) {
      if (dataX.length > 0) {
        dataX = []; dataY = []; dataZ = []; heartrate = []; startTM = 0; endTM = 0
      }
      tasksend = 0
      if (HeartRate !== 0) setHeartRate(0)
      return
    }
    //采用高精度的时间戳，chrome测试精确到0.1ms
    var now = performance.timing.fetchStart + (performance.now() << 0)
    if (dataX.length === 0) {
      //起始时间
      startTM = now
    }
    if (factor === -1) {
      if ((acceleration.x * 10.) << 0 === acceleration.x * 10 && (acceleration.y * 10.) << 0 === acceleration.y * 10 && (acceleration.z * 10.) << 0 === acceleration.z * 10)
        factor = 10
      else factor = 100
    }
    //alert("factor"+factor+" acceleration"+acceleration.x+" "+acceleration.y+" "+acceleration.z)
    dataX.push((acceleration.x * factor) << 0)
    dataY.push((acceleration.y * factor) << 0)
    dataZ.push((acceleration.z * factor) << 0)
    heartrate.push(HeartRate)

    //ensure  timespan cal be calculated
    if (dataX.length < 20) return

    //should monitor at least 3 seconds data points
    if (now - startTM < SecondsWanted * 1000) return

    // data point of each seconds should more than 40 points
    let dataDensity = dataX.length / SecondsWanted
    let DataIntegrity = dataX.length === dataY.length && dataY.length === dataZ.length && dataZ.length === heartrate.length
    setLenPerSecond(dataDensity)
    if (dataDensity < 40 || !DataIntegrity) {
      //alert("数据密度不足，采样失败，请更换设备")
      SaveDataAndRestartRecording()
      return
    }
    endTM = now
    //压缩时间，第一个值是绝对时间戳，后续是毫秒计数的时间流逝值
    let model = SaveDataAndRestartRecording();
    if (model === null) return
    tasksend += 1
    //save to server
    model.Put(StartHeartBeatEvent)
  }
  const StartHeartBeatEvent = (v) => setHeartRate(v.heartbeat);
  const handleAcceleration = (event) => {
    var acceleration = useGravity ? event.accelerationIncludingGravity : event.acceleration
    saveToHistory(acceleration as IAcceleration)
  }
  const [lenPerSecond, setLenPerSecond] = useState(0)

  const [stopped, setStopped] = useState<Boolean>(true)

  const handleCharacteristicValueChanged = (event: Event) => {
    let characteristic = event.target as BluetoothRemoteGATTCharacteristic
    let value = characteristic.value
    setHeartRate(value.getInt8(1))
  }
  const StartRetrievHeartbeatData = e => {

    stopped && navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
      .then(device => device.gatt.connect())
      .then(server => server.getPrimaryService('heart_rate'))
      .then(service => service.getCharacteristic(0x2A37))
      .then(characteristic => {
        console.log("characteristicvaluechanged")
        characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        // Reading Battery Level…
        return characteristic.startNotifications();
      })
      .catch(error => { console.error(error); });
    setStopped(!stopped)
  }

  return <div>
    <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "3em 3em 3em 3em" }} onClick={StartRetrievHeartbeatData} >
      {!stopped ? `发送${tasksend}每秒采样点:${lenPerSecond.toPrecision(3)} 当前心跳:${HeartRate}` : "点击采集心跳加速度训练数据"}
    </Button>
  </div>
}
