import React, { useState, useEffect } from 'react';
import { MeasureAccelerometer } from "../models/MeasureAccelerometer"


export interface IAcceleration { x: number | null, y: number | null, z: number | null }
let DataAcceleration: number[] = []
let DataTime: number[] = []
export function Accelerometer({ multiplier = 10, useGravity = false }: { multiplier?: number, useGravity?: boolean }) {

  useEffect(() => {
    window.addEventListener('devicemotion', handleAcceleration)
    return () => window.removeEventListener('devicemotion', handleAcceleration)
  })
  const SaveDataAndRestartRecording = () => {
    let model = new MeasureAccelerometer("0", [...DataAcceleration], [...DataTime], [])
    DataAcceleration = []
    DataTime = []
    return model
  }
  const saveToHistory = (acceleration: IAcceleration) => {
    //采用高精度的时间戳，chrome测试精确到0.1ms
    var now = performance.timing.fetchStart+(performance.now()<<0)
    DataAcceleration.push(acceleration.x * multiplier << 0)
    DataAcceleration.push(acceleration.y * multiplier << 0)
    DataAcceleration.push(acceleration.z * multiplier << 0)
    DataTime.push(DataTime.length>0? now-DataTime[DataTime.length-1]:now)

    //ensure  timespan cal be calculated
    let timeLength = DataTime.length; if (timeLength < 20) return

    //should monitor at least 3 seconds data points
    var timeSpan: number = DataTime[timeLength - 1] - DataTime[0]
    const TimespanWanted = 30
    if (timeSpan < TimespanWanted * 1000) return

    // data point of each seconds should more than 40 points
    let dataPointDenseEnough=timeLength > TimespanWanted *  40
    let DataIntegrity=(timeLength*3) === DataAcceleration.length
    //alert(".x"+acceleration.x+ " .y"+acceleration.y+" .z"+acceleration.z+" DataAcceleration length"+DataAcceleration.length+" timeSpan"+timeSpan);
    if (!dataPointDenseEnough || !DataIntegrity ) {
      SaveDataAndRestartRecording()
      return
    }
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
