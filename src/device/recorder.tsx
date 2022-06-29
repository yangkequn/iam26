import React, { useState, useContext } from "react";
import { Button, Tooltip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { GlobalContext } from "../base/GlobalContext"
import { HeartbeatAudioModel } from "../models/HeartbeatAudioModel"
import { MSRE } from "../base/FunctionMath"

//每秒一条心跳
const heartrate: number[] = []
const audioChunk: Blob[] = []
export const RecorderComponent = () => {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const { HeartRate, setHeartRate } = useContext(GlobalContext)
    const [messege, setMessage] = useState("")

    const saveToHistory = () => {
        var heartreateMSE = MSRE(heartrate)
        setMessage("heartreateMSE" + heartreateMSE)
        //if (heartreateMSE < 0.1) return ClearData()

        var model = new HeartbeatAudioModel(heartrate.join(","), [...audioChunk])
        setMessage("开始上传" + audioChunk.length)
        //save to server
        model.Put()
    }
    const ClearData = () => {
        heartrate.splice(0, heartrate.length)
        audioChunk.splice(0, audioChunk.length)
    }
    const onDataAvailable = (e: BlobEvent) => {
        setMessage("录音片段" + audioChunk.length)
        //因为心跳标签不存在，所以放弃相应音频
        if (HeartRate === 0) return ClearData()
        if (e.data.size === 0) return ClearData()
        //确保标签和样本等长
        if (heartrate.length !== audioChunk.length) return ClearData()

        // pop the oldest chunk
        if (audioChunk.length > 1000) {
            audioChunk.shift()
            heartrate.shift()
        }
        heartrate.push(HeartRate)
        audioChunk.push(e.data)
        if (audioChunk.length > 5) {
            saveToHistory()
            return ClearData()
        }

    }
    //启用麦克风录制声音
    const startRecording = (e: any) => {
        let m = window.navigator.mediaDevices;
        //未使用https则不可用
        if (!m) return;
        m.getUserMedia({ audio: true, video: false }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = onDataAvailable;
            mediaRecorder.start(1000);

            mediaRecorder.onstop = e => null
            setMediaRecorder(mediaRecorder)

        })
    }
    return <div>
        {!!mediaRecorder ? <Button style={{ margin: "0 2em 0 1em" }} onClick={() => {
            !!mediaRecorder && mediaRecorder.stop()
            setMediaRecorder(null)
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