import React, { useState, useContext, useEffect } from "react";
import { Button, Tooltip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { GlobalContext } from "../base/GlobalContext"
import { HeartbeatAudioModel } from "../models/HeartbeatAudioModel"
import { MSRE } from "../base/FunctionMath"

//每秒一条心跳
const heartrate: number[] = []
const dataBlobs: Blob[] = []
const audiodDurati2onSeconds: number = 10
let mediaRecorder: MediaRecorder | null = null
const audioFormat = MediaRecorder.isTypeSupported("audio/ogg") ? "audio/ogg" : "audio/webm"
export const RecorderComponent = () => {
    const { HeartRate, setHeartRate } = useContext(GlobalContext)
    const [messege, setMessage] = useState("")
    const [recording, setRecording] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => heartrate.push(HeartRate), 1000);
        return () => clearInterval(interval);
    }, []);
    const onDataAvailable = (e: BlobEvent) => {
        //因为心跳标签不存在，所以放弃相应音频
        if (e.data.size === 0) {
            console.error("录音片段e.data.size === 0")
            return
        }
        //确保标签和样本等长
        var numToRemove = heartrate.length - audiodDurati2onSeconds
        if (numToRemove > 0) heartrate.splice(0, numToRemove)

        dataBlobs.push(e.data)
        setMessage("录音片段已经存放" + dataBlobs.length + "个" + (dataBlobs.length > audiodDurati2onSeconds) + "," + !!mediaRecorder)
        //stop data
        if (dataBlobs.length < audiodDurati2onSeconds) return

        if (!mediaRecorder || mediaRecorder.state === "inactive") return

        mediaRecorder.stop()
    }
    const onMediaRecorderStop = (e: Event) => {
        console.error("onMediaRecorderStop")
        var heartreateMSE = MSRE(heartrate)
        //convert  e.data to mp3 file    
        var blob = new Blob(dataBlobs, { 'type': audioFormat })
        var model = new HeartbeatAudioModel(heartrate.join(","), blob)
        //save to server
        model.Put()

        //clear dataBlobs,and restart recorder
        dataBlobs.splice(0, dataBlobs.length)
        if (!!mediaRecorder && setRecording) mediaRecorder.start(1000);
    }

    //启用麦克风录制声音
    const startRecording = (e: any) => {
        //未使用https则不可用
        if (!window.navigator.mediaDevices) return;
        window.navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
            var options = { "audioBitsPerSecond": 128000, 'type': audioFormat }
            mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = onDataAvailable;
            mediaRecorder.onstop = onMediaRecorderStop
            mediaRecorder.start(1000);
            setRecording(true)

        })
    }
    return <div>
        {!!mediaRecorder ? <Button style={{ margin: "0 2em 0 1em" }} onClick={() => {
            !!mediaRecorder && mediaRecorder.stop()
            setRecording(false)
        }}>
            <Tooltip title={"声音录制中，停止录制"} placement={"top"}>
                <StopIcon htmlColor={!!mediaRecorder ? "red" : "#888"} fontSize="medium"                   ></StopIcon>
            </Tooltip>停止录制 {messege}</Button>
            :
            <Button style={{ margin: "0 2em 0 1em" }} onClick={startRecording}>
                <Tooltip title={"声音"} placement={"top"}>
                    <MicIcon htmlColor="#888" fontSize="medium" ></MicIcon>
                </Tooltip>
                开始录音
            </Button>
        }
    </div>
}