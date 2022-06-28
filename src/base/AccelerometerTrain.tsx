/// <reference types="web-bluetooth" />
import React, { useState, useEffect, useContext } from 'react';
import { MeasureAccelerometerTraining } from "../models/MeasureAccelerometerTraining"
import { Button } from "@mui/material";
import { GlobalContext } from "../base/GlobalContext";
import { MSRE } from "./FunctionMath"
import { CompressString } from "./FunctionCompress"

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
  var data: Array<number|null> =[...dataX,...dataY,...dataZ,...heartrate]
  for (var i = data.length - 1; i >= 1; i--) if (data[i] === data[i - 1]) data[i] = null
  reset()
  return new MeasureAccelerometerTraining("0", CompressString([startTM, endTM, 4, dataX.length,...data].join(",")), []);
}


export function AccelerometerTrain({ multiplier = 10, useGravity = false }: { multiplier?: number, useGravity?: boolean }) {
  const { AcceleroData, setAcceleroData } = useContext(GlobalContext)
  const { HeartRate, setHeartRate } = useContext(GlobalContext)
  const saveToHistory = () => {
    if (stopped || HeartRate === 0 || AcceleroData.length % 3 !== 0 || AcceleroData.length === 0) {
      if (dataX.length > 0) {
        dataX = []; dataY = []; dataZ = []; heartrate = []; startTM = 0; endTM = 0
      }
      tasksend = 0
      factor = -1
      return
    }
    //采用高精度的时间戳，chrome测试精确到0.1ms
    var now = performance.timing.fetchStart + (performance.now() << 0)
    if (dataX.length === 0) {
      //起始时间
      startTM = now
    }
    if (factor === -1) {
      let x = AcceleroData[0], y = AcceleroData[1], z = AcceleroData[2]
      if ((x * 10.) << 0 === x * 10 && (y * 10.) << 0 === y * 10 && (z * 10.) << 0 === z * 10)
        factor = 10
      else factor = 100
    }

    for (var i = 0; i < AcceleroData.length; i++) {
      let ax = AcceleroData[i], ay = AcceleroData[i + 1], az = AcceleroData[i + 2]
      dataX.push((ax * factor) << 0)
      dataY.push((ay * factor) << 0)
      dataZ.push((az * factor) << 0)
      heartrate.push(HeartRate)
    }

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
    model.Put(StartHeartRateEvent)
  }
  useEffect(saveToHistory, [AcceleroData])
  const StartHeartRateEvent = (v:any) => setHeartRate(v.HeartRate);
  const [lenPerSecond, setLenPerSecond] = useState(0)
  const [stopped, setStopped] = useState<Boolean>(true)
  return <div>
    <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "3em 3em 3em 3em" }} onClick={e => setStopped(!stopped)} >
      {!stopped ? `发送${tasksend}每秒采样点:${lenPerSecond.toPrecision(3)} 当前心跳:${HeartRate}` : "点击采集心跳加速度训练数据"}
    </Button>
  </div>
}
