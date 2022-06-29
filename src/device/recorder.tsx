import React, { useState, useContext } from "react";
import { Button, Tooltip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { GlobalContext } from "../base/GlobalContext"
import { HeartbeatAudioModel } from "../models/HeartbeatAudioModel"
import { MSRE } from "../base/FunctionMath"

//每秒一条心跳
const heartrate: number[] = []
const audiodDuration = 60 * 1000
export const RecorderComponent = () => {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const { HeartRate, setHeartRate } = useContext(GlobalContext)
    const [messege, setMessage] = useState("")

    setTimeout(() => heartrate.push(HeartRate), 1000);
    const onDataAvailable = (e: BlobEvent) => {
        //因为心跳标签不存在，所以放弃相应音频
        if (e.data.size === 0) {
            setMessage("录音片段e.data.size === 0")
        }
        //确保标签和样本等长
        heartrate.splice(0, heartrate.length - audiodDuration / 1000)

        var heartreateMSE = MSRE(heartrate)
        setMessage("heartreateMSE" + heartreateMSE)
        //if (heartreateMSE < 0.1) return ClearData()

        var model = new HeartbeatAudioModel(heartrate.join(","), e.data)
        //清空数据
        heartrate.splice(0, heartrate.length)
        //save to server
        model.Put()
    }
    //启用麦克风录制声音
    const startRecording = (e: any) => {
        let m = window.navigator.mediaDevices;
        //未使用https则不可用
        if (!m) return;
        m.getUserMedia({ audio: true, video: false }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = onDataAvailable;
            mediaRecorder.start(audiodDuration);

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