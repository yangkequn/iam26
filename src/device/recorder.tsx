import React, { useState} from "react";
import {Box, Tooltip} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

export const RecorderComponent = ({corpusId}) => {
    const [mediaRecorder, setMediaRecorder] = useState(null)
    let chunks = [];

    const uploadAudio = (blob) => {
        let data = new FormData()
        data.append('type', 'ogg')
        data.append('audio', new File(blob, 'recording.ogg'))
        //JwtRequest().put(Url.CorpusFile(corpusId,"audio"), data).then(ret => console.log("excecute succ"))
    }
    //启用麦克风录制声音
    const startRecording = e => {
        let m = window.navigator.mediaDevices;
        //未使用https则不可用
        if (!m) return;
        m.getUserMedia({audio: true, video: false}).then(stream => {
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.start();

            mediaRecorder.onstop = e => {
                const blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
                uploadAudio(chunks)
                chunks = []

                let audioURL=window.URL.createObjectURL(blob)
                console.log("mediaRecorder.state", mediaRecorder.state,audioURL)
                setMediaRecorder(null)
            }
            setMediaRecorder(mediaRecorder)

        })
    }
    return <div>
        <Tooltip title={"声音"} placement={"top"}>
            <MicIcon htmlColor="#888" fontSize="medium" onClick={startRecording}></MicIcon>
        </Tooltip>

        {!!mediaRecorder && <Box p={"0 2em 0 1em"}>
            <Tooltip title={"停止录制"} placement={"top"}>
                <StopIcon htmlColor={!!mediaRecorder ? "red" : "#888"} fontSize="medium"
                          onClick={e => mediaRecorder.stop()}></StopIcon>
            </Tooltip></Box>}
    </div>
}