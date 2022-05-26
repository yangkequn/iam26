import React, { createRef, useEffect, useState, useContext } from "react";
import "../base/css.css"
import "./MyTrace.css";
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import { Button } from "@mui/material";
import { cv0 } from "../base/css";
import { TraceModel } from "../models/TraceModel";
import { BindTextFieldModel as mt } from "../base/BindModelComponent";
import { MeasureItem } from "../models/MeasureItem";
import { ActItem } from "../models/ActItem";
import { TraceItem } from "../models/TraceItem";
import DeleteIcon from '@mui/icons-material/Delete';
import { Accelerometer } from "../base/Accelerometer";
import { AccelerometerTrain } from "../base/AccelerometerTrain";
import { SelectBlueToothAccelerometer } from "../device/SelectBlueToothAccelerometer" 
import { SelectBluetoothHeartrateDevice } from "../device/SelectBluetoothHeartrateDevice";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { MusicPlayerSlider, base64EncodedMp3 } from "./SleepMp3Player";
import { GlobalContext } from "../base/GlobalContext";
import { unixTime } from "../base/Fuctions";
import { time } from "console";

let lastPlay = new Date().getTime()
let lastWaitTime = 0
export const BackGroundPlayer = () => {

    const audioref = createRef<HTMLMediaElement>()

    const [volume, setVolume] = useState<number>(0.7)
    const [play, setPlay] = useState(true)
    const { HeartRate, setHeartRate } = useContext(GlobalContext)
    useEffect(() => {
        if (audioref.current.ended && HeartRate > 0 && (new Date().getTime() - lastPlay) > 3000)
            audioref.current.play()
    }, [HeartRate, audioref])
    const Replay = () => {
        if (HeartRate === 0) return
        if (!play) return
        let now = new Date().getTime()
        let shouldPlay: number = 60 * 1000 + lastPlay
        let wait = shouldPlay - now
        wait = lastWaitTime * 0.2 + wait * 0.8
        lastWaitTime = wait
        console.log("wait", wait, "HeartRate", HeartRate, "playbackRate", audioref.current.playbackRate, "span", 60000 / Math.max(20, HeartRate))
        lastPlay = now
        audioref.current.volume = volume
        if (wait <= 0) {
            audioref.current.playbackRate *= 1.1
            audioref.current.play()
        } else {
            if (wait > 200) {
                audioref.current.playbackRate *= 0.9
            }
            setTimeout(e => (document.getElementById("mybgAudio") as HTMLMediaElement).play(), wait)
        }
    }
    const bgnames = ["RainDropsOnForest.mp3", "高街, 交通.mp3", "大学.mp3", "小河.mp3", "山风.mp3", "虫鸣.mp3", "下水道.mp3", "艘小帆船, 船帆随风飘扬.mp3", "公园喷泉.mp3", "山间小溪.mp3", "微风知了.mp3", "自助餐厅.mp3", "银行脚步.mp3", "学校操场7-11.mp3", "城市天际线.mp3", "大教堂游客.mp3", "报纸编辑部.mp3", "主要的步行街.mp3", "凡尔赛宫市场.mp3", "噼里啪啦篝火.mp3", "宴会大厅室内.mp3", "森林公园鸟类.mp3", "武汉城镇市场.mp3", "武汉长江岸桥.mp3", "夏天室外虫鸣.ogg", "丽晶酒店咖啡厅.mp3", "夜晚草丛昆虫叫.mp3", "白天住宅微风鸟.mp3", "街头的蔬菜市场.mp3", "骡子铃铛人聊天.mp3", "巴拉圭亚松森银行.mp3", "春天下午海德公园.mp3", "狭窄的街道与人群.mp3", "水果和蔬菜市场覆盖.mp3", "牛拉吱吱嘎嘎的木车.mp3", "草原风软阵风鸟微弱.mp3", "水果和蔬菜市场基布多-上校.mp3", "工人修理鹅卵石的街道.mp3", "草原上的风荡漾鸟鸣风吹.mp3", "骡子火车通行证从左到右.mp3", "在繁忙的马路交界处没有交通.mp3"]
    return <audio ref={audioref} id={`mybgAudio`} key="myAudio" src={"/bgsound/牛拉吱吱嘎嘎的木车.mp3"} onPause={e => Replay()} autoPlay={play}
        preload="true" loop={false}    ></audio>
}