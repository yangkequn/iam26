import React, { useState, useEffect, useContext } from 'react';
import { MeasureAccelerometer } from "../models/MeasureAccelerometer"
import { GlobalContext } from "../base/GlobalContext"
import { Button } from "@mui/material";
var lz = require('lz-string');
class temporaryAccelerometer {
  x: number[];
  y: number[];
  z: number[];
  start: number;
  end: number;
  constructor(start = 0, end = 0, dataX = [], dataY = [], dataZ = []) {
    this.x = dataX;
    this.y = dataY;
    this.z = dataZ;
    this.start = start;
    this.end = end;
  }
  public ToMeasureAccelerometer() {
    var data = [this.start, this.end,  this.x.length].concat(this.x).concat(this.y).concat(this.z)
    return new MeasureAccelerometer("0", lz.compress(data.join(',')), []);
  }

}
export interface IAcceleration { x: number | null, y: number | null, z: number | null }
let dataX: Array<number> = []; let dataY: Array<number> = []; let dataZ: Array<number> = [];
//let DataAcceleration: number[] = []
let factor = -1, startTM = 0, endTM = 0
const SecondsWanted = 6
let tasksend = 0
export function Accelerometer({ multiplier = 10, useGravity = false }: { multiplier?: number, useGravity?: boolean }) {
  const { HeartRate, setHeartRate } = useContext(GlobalContext) 
  useEffect(() => {
    window.addEventListener('devicemotion', handleAcceleration)
    return () => window.removeEventListener('devicemotion', handleAcceleration)
  })
  const SaveDataAndRestartRecording = () => {
    let model = new temporaryAccelerometer(startTM, endTM, dataX, dataY, dataZ)
    dataX = []; dataY = []; dataZ = [];
    return model
  }
  const saveToHistory = (acceleration: IAcceleration) => {
    if (stopped) {
      if (dataX.length > 0) {
        dataX = []; dataY = []; dataZ = []; startTM = 0; endTM = 0
      }
      tasksend = 0
      return
    }
    //采用高精度的时间戳，chrome测试精确到0.1ms
    var now = performance.timing.fetchStart + (performance.now() << 0)
    if (dataX.length === 0) {
      //起始时间
      startTM = now
    }
    if (factor === -1) {
      if ((acceleration.x * 10.) << 0 === acceleration.x * 10 && (acceleration.y * 10.) << 0 === acceleration.y * 10 && (acceleration.z * 10.) << 0 === acceleration.z * 10) {
        factor = 10
      } else {
        factor = 100
      }
    }
    dataX.push((acceleration.x * factor) << 0)
    dataY.push((acceleration.y * factor) << 0)
    dataZ.push((acceleration.z * factor) << 0)

    //ensure  timespan cal be calculated
    if (dataX.length < 20) return

    //should monitor at least 3 seconds data points
    if (now - startTM < SecondsWanted * 1000) return

    // data point of each seconds should more than 40 points
    let dataDensity = dataX.length / SecondsWanted
    let DataIntegrity = dataX.length === dataY.length && dataY.length === dataZ.length
    setLenPerSecond(dataDensity)
    if (dataDensity < 40 || !DataIntegrity) {
      //alert("数据密度不足，采样失败，请更换设备")
      SaveDataAndRestartRecording()
      return
    }
    endTM = now
    //压缩时间，第一个值是绝对时间戳，后续是毫秒计数的时间流逝值
    let model = SaveDataAndRestartRecording();
    //数据点密度太高，则压缩减半，把两个点压缩为一个点
    [model.x, model.y, model.z].forEach((data) => {
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
    tasksend += 1
    //save to server
    model.ToMeasureAccelerometer().Put(StartHeartRateEvent)
  }
  const StartHeartRateEvent = (v) => setHeartRate(v.HeartRate);
  const handleAcceleration = (event) => {
    var acceleration = useGravity ? event.accelerationIncludingGravity : event.acceleration
    saveToHistory(acceleration as IAcceleration)
  }
  const [lenPerSecond, setLenPerSecond] = useState(0)

  const [stopped, setStopped] = useState<Boolean>(true)


  return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "3em 3em 3em 3em" }} onClick={e => setStopped(!stopped)} >
    {!stopped ? `发送${tasksend}每秒采样点:${lenPerSecond.toPrecision(3)} 当前心跳:${HeartRate}` : "点击开始记录"}
  </Button>

}
