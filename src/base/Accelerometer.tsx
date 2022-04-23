import React, { useState, useEffect } from 'react';
import { Jwt } from '../models/Jwt';
import { MeasureAccelerometer } from "../models/MeasureAccelerometer"


export interface IAcceleration { x: number | null, y: number | null, z: number | null }

let time = new Date().getTime()
export function Accelerometer({ multiplier = 1000, useGravity = true }: { multiplier?: number, useGravity?: boolean }) {

  const [measureIndex, setMeasureIndex] = useState<MeasureAccelerometer>(new MeasureAccelerometer("0", [], [], []))
  useEffect(() => {
    window.addEventListener('devicemotion', handleAcceleration)
    return () => window.removeEventListener('devicemotion', handleAcceleration)
  })

  const saveToHistory = (acceleration: IAcceleration) => {
    var now=new Date().getTime()
    var timespan = now- time
    measureIndex.data.push(Number.parseFloat(acceleration.x.toFixed(5)))
    measureIndex.data.push(Number.parseFloat(acceleration.y.toFixed(5)))
    measureIndex.data.push(Number.parseFloat(acceleration.z.toFixed(5)))
    measureIndex.time.push(now)
    measureIndex.time.push(now)
    measureIndex.time.push(now)
    // if sec same with last time, just return 
    if (timespan  < 4000) return
    //压缩时间，第一个值是绝对时间戳，后续是毫秒计数的时间流逝值
    for (let i = measureIndex.time.length-1; i >0; i--) {
      measureIndex.time[i]=measureIndex.time[i]-measureIndex.time[i-1]
    }
    measureIndex.Put(null)
    setMeasureIndex(new MeasureAccelerometer("0", [], [], []))
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
