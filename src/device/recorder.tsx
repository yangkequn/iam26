import React, { useState, useContext } from "react";
import { Box, Tooltip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { GlobalContext } from "../base/GlobalContext"

export const RecorderComponent = () => {
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const { audioChunk, setAudioChunk } = useContext(GlobalContext)

    const uploadAudio = (blob) => {
        let data = new FormData()
        data.append('type', 'ogg')
        data.append('audio', new File(blob, 'recording.ogg'))
        //JwtRequest().put(Url.CorpusFile(corpusId,"audio"), data).then(ret => console.log("excecute succ"))
    }
    const ToData = (chunks: Blob[]) => {
        let blob = new Blob(audioChunk, { 'type': 'audio/ogg; codecs=opus' });
        let audioURL = window.URL.createObjectURL(blob)
        //setAudio(audioURL)
    }
    const onDataAvailable = (e: BlobEvent) => {
        // pop the oldest chunk
        if (audioChunk.length > 1000) audioChunk.shift()

        if (e.data.size > 0) setAudioChunk([...audioChunk, e.data])
    }
    //启用麦克风录制声音
    const startRecording = e => {
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
        <Tooltip title={"声音"} placement={"top"}>
            <MicIcon htmlColor="#888" fontSize="medium" onClick={startRecording}></MicIcon>
        </Tooltip>

        {!!mediaRecorder && <Box p={"0 2em 0 1em"}>
            <Tooltip title={"声音录制中，停止录制"} placement={"top"}>
                <StopIcon htmlColor={!!mediaRecorder ? "red" : "#888"} fontSize="medium"
                    onClick={e => mediaRecorder.stop()}></StopIcon>
            </Tooltip></Box>}
    </div>
}