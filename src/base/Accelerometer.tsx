import React, { useState, useEffect, useContext } from 'react';
import { MeasureAccelerometer } from "../models/MeasureAccelerometer"
import { GlobalContext } from "../base/GlobalContext"
import { Box } from '@mui/system';
import { Button } from "@mui/material";

export interface IAcceleration { x: number | null, y: number | null, z: number | null }
let DataAcceleration: number[] = []
export function Accelerometer({ multiplier = 10, useGravity = false }: { multiplier?: number, useGravity?: boolean }) {
  const { Heartbeat, setHeartbeat } = useContext(GlobalContext)
  useEffect(() => {
    window.addEventListener('devicemotion', handleAcceleration)
    return () => window.removeEventListener('devicemotion', handleAcceleration)
  })
  const SaveDataAndRestartRecording = () => {
    let model = new MeasureAccelerometer("0", DataAcceleration, [])
    DataAcceleration = []
    return model
  }
  const SecondsWanted = 6
  const saveToHistory = (acceleration: IAcceleration) => {
    if (stopped) {
      if (DataAcceleration.length > 0) DataAcceleration = []
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
    DataAcceleration.push((acceleration.x * multiplier) << 0)
    DataAcceleration.push((acceleration.y * multiplier) << 0)
    DataAcceleration.push((acceleration.z * multiplier) << 0)


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
    //数据点太多，点数压缩减半，把两个点压缩为一个点
    while (dataDensity > 350) {
      //把每两个加速度合并为一个加速度
      let je = 3 + 6 * (((DataAcceleration.length - 3) / 6)<<0);
      let cnt = 0;
      for (let j = 3; j < je; cnt += 1, j += 6) {
        DataAcceleration[cnt * 3 + 3] = (DataAcceleration[j] + DataAcceleration[j + 3]) / 2
        DataAcceleration[cnt * 3 + 4] = (DataAcceleration[j + 1] + DataAcceleration[j + 4]) / 2
        DataAcceleration[cnt * 3 + 5] = (DataAcceleration[j + 2] + DataAcceleration[j + 5]) / 2
      }
      //如果剩一点单点数据，那么单独保存
      if (je !== (DataAcceleration.length - 6)) {
        DataAcceleration[cnt * 3 + 3] = DataAcceleration[je]
        DataAcceleration[cnt * 3 + 4] = DataAcceleration[je + 1]
        DataAcceleration[cnt * 3 + 5] = DataAcceleration[je + 2]
        cnt += 1
      }

      //删除缩减后的数据
      DataAcceleration.splice(cnt * 3 + 3, DataAcceleration.length - (cnt * 3 + 3))
      //重写个数
      DataAcceleration[2] = DataAcceleration.length
    }
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


  return <Button variant="contained" size="large" color={stopped ? "primary" : "secondary"} sx={{ p: "3em 3em 3em 3em" }} onClick={e => setStopped(!stopped)} >
    {!stopped ? `每秒采样点:${lenPerSecond} 当前心跳:${Heartbeat}` : "点击开始记录"}
  </Button>

}
