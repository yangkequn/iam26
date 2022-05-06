import React, { useState, useEffect } from 'react';
import { MeasureAccelerometer } from "../models/MeasureAccelerometer"


export interface IAcceleration { x: number | null, y: number | null, z: number | null }
let DataAcceleration: number[] = []
export function Accelerometer({ multiplier = 10, useGravity = false }: { multiplier?: number, useGravity?: boolean }) {

  useEffect(() => {
    window.addEventListener('devicemotion', handleAcceleration)
    return () => window.removeEventListener('devicemotion', handleAcceleration)
  })
  const SaveDataAndRestartRecording = () => {
    let model = new MeasureAccelerometer("0", DataAcceleration,  [])
    DataAcceleration = []
    return model
  }
  const TimespanWanted = 10
  const saveToHistory = (acceleration: IAcceleration) => {
    //采用高精度的时间戳，chrome测试精确到0.1ms
    var now = performance.timing.fetchStart + (performance.now() << 0)
    if (DataAcceleration.length === 0) {
      //起始时间
      DataAcceleration.push(now)
      //结束时间
      DataAcceleration.push(0)
      //number
      DataAcceleration.push(0)
    } else {
    DataAcceleration.push((acceleration.x * multiplier )<< 0)
    DataAcceleration.push((acceleration.y * multiplier )<< 0)
    DataAcceleration.push((acceleration.z * multiplier )<< 0)
    }

    //ensure  timespan cal be calculated
    if (DataAcceleration.length < 20) return

    //should monitor at least 3 seconds data points
    if (now - DataAcceleration[0] < TimespanWanted * 1000) return

    // data point of each seconds should more than 40 points
    let dataPointDenseEnough = DataAcceleration.length > TimespanWanted * 40
    let DataIntegrity = DataAcceleration.length%3===0
    if (!dataPointDenseEnough || !DataIntegrity) {
      SaveDataAndRestartRecording()
      return
    }
    DataAcceleration[1]=now
    DataAcceleration[2]=DataAcceleration.length
    //压缩时间，第一个值是绝对时间戳，后续是毫秒计数的时间流逝值
    let model = SaveDataAndRestartRecording()
    //save to server
    model.Put(null)
  }

  const handleAcceleration = (event) => {
    var acceleration = useGravity ? event.accelerationIncludingGravity : event.acceleration

    saveToHistory(acceleration as IAcceleration)
  }
  const [lenPerSecond, setLenPerSecond] = useState(0)
  return <div key={"ac" + lenPerSecond}>{"data per second:" + lenPerSecond}</div>

}
//const DisplayAccelerometer = (acceleration: IAcceleration = { x: 0, y: 0, z: 0 }, rotation: null | Boolean = null) => {
//  const DisplayAccelerometer = ({acceleration = { x: 0, y: 0, z: 0 }, rotation= null}:{acceleration: IAcceleration,rotation: null | Boolean }) => {
