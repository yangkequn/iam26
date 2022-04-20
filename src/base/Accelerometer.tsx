import React, { useState, useEffect } from 'react';


export interface IAcceleration { x: number | null, y: number | null, z: number | null }
let CurrentSecondAccelerations = []
let Last10SecondAccelerations = []
let timeSecond = 0
export function Accelerometer({  multiplier = 1000, useGravity = true }: {  multiplier?: number, useGravity?: boolean }) {

  useEffect(() => {
    window.addEventListener('devicemotion', handleAcceleration)
    return () => {
      window.removeEventListener('devicemotion', handleAcceleration)
    }
  }) 

  const saveToHistory = (acceleration: IAcceleration) => { 
    CurrentSecondAccelerations.push(acceleration)
    var sec = new Date().getTime() / 1000 >> 0
    // if sec same with last time, just return 
    if (sec === timeSecond)      return
        
    timeSecond = sec
    setLenPerSecond( CurrentSecondAccelerations.length)
    Last10SecondAccelerations.push(CurrentSecondAccelerations)
    CurrentSecondAccelerations = []

    if (Last10SecondAccelerations.length > 10) {
      Last10SecondAccelerations.shift()
    }
  }

  const handleAcceleration = (event) => {
    var acceleration = useGravity ? event.accelerationIncludingGravity : event.acceleration

    saveToHistory(acceleration as IAcceleration)
  }
  const [lenPerSecond,setLenPerSecond]=useState(0)
  return <div key={"ac" + lenPerSecond}>{"data per second:" + lenPerSecond}</div>

}
//const DisplayAccelerometer = (acceleration: IAcceleration = { x: 0, y: 0, z: 0 }, rotation: null | Boolean = null) => {
//  const DisplayAccelerometer = ({acceleration = { x: 0, y: 0, z: 0 }, rotation= null}:{acceleration: IAcceleration,rotation: null | Boolean }) => {
