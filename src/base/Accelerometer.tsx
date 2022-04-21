import React, { useState, useEffect } from 'react';
import { Jwt } from '../models/Jwt';
import { MeasureIndex } from "../models/MeasureIndex"


export interface IAcceleration { x: number | null, y: number | null, z: number | null }

let time = new Date().getTime()
export function Accelerometer({ multiplier = 1000, useGravity = true }: { multiplier?: number, useGravity?: boolean }) {

  const [measureIndex, setMeasureIndex] = useState<MeasureIndex>(new MeasureIndex("0", Jwt.Get().id, "accelero", [], [], []))
  useEffect(() => {
    window.addEventListener('devicemotion', handleAcceleration)
    return () => {
      window.removeEventListener('devicemotion', handleAcceleration)
    }
  })

  const saveToHistory = (acceleration: IAcceleration) => {
    var timespan = new Date().getTime() - time
    measureIndex.data.push(acceleration)
    measureIndex.time.push(measureIndex.time.length === 0 ? time : timespan)
    // if sec same with last time, just return 
    if (timespan < 4000) return
    measureIndex.Put(null)
    time = new Date().getTime()
    setMeasureIndex(new MeasureIndex("0", Jwt.Get().id, "accelero", [], [], []))
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
