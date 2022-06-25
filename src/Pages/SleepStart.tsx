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
import { AccelerometerTrain } from "../base/AccelerometerTrain";
import { SelectBlueToothAccelerometer } from "../device/SelectBlueToothAccelerometer"
import { SelectBluetoothHeartrateDevice } from "../device/SelectBluetoothHeartrateDevice";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { BackGroundPlayer } from "./SleepBackGroudPlayer";
import { MusicPlayerSlider, base64EncodedMp3 } from "./SleepMp3Player";
import { GlobalContext } from "../base/GlobalContext";
import { unixTime } from "../base/Fuctions";
import { time } from "console";

let lastPlay = new Date().getTime()
let lastWaitTime = 0
function TraceModelItem({ item }: { item: TraceModel; }) {

    //monitor initial value,to avoid unnecessary update
    const [updateTM, setUpdateTM] = useState<number>(new Date().getTime())
    const update = () => setUpdateTM(new Date().getTime())

    //autoload from server
    useEffect(() => {
        !!item.measureId && MeasureItem.From(item).Load(e => setUpdateTM(new Date().getTime()))
        !!item.actId && ActItem.From(item).Load(e => setUpdateTM(new Date().getTime()))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item])
    //    useEffect(() => setUpdateTM(new Date().getTime()), [item.updated])


    let TypeText = (!!item["measureId"] && "效果") || (!!item["actId"] && "方法")

    return !!item.traceId && !!updateTM ? <div className={`cr0 trace ${!!item["measureId"] && "traceMeasure"}`}  >
        <div className={"traceIcon"} > {TypeText} </div>
        {/* <TextField className="traceText" required label="名称" variant="standard" {...{defaultValue: item["name"]}}  /> */}
        <TextField className="traceText" required label="名称" variant="standard" key={`${updateTM}_name`}
            {...mt(item, "name", { onBlur: e => item.Save(setUpdateTM) })} />
        <TextField className="traceText" required label="单位" variant="filled" key={`${updateTM}_unit`}
            {...mt(item, "unit", { onBlur: e => item.Save(setUpdateTM) })} />
        <TextField className="traceText" label="细节" variant="standard" key={`${updateTM}_detail`}
            {...mt(item, "detail", { onBlur: e => item.Save(setUpdateTM) })} />
        <TextField className="traceText" label="值" variant="filled" key={`${updateTM}_value`}
            {...mt(item, "value", { onBlur: e => item.Save(setUpdateTM) })} />
        <TextField className="traceText" label="" type="datetime-local" variant="standard" InputLabelProps={{ shrink: true, }}
            {...mt(item, "time", { onBlur: e => item.Save(setUpdateTM) })} />
        <TextField className="traceText" label="备注" variant="filled" key={`${updateTM}_memo`}
            {...mt(item, "memo", { onBlur: e => item.Save(setUpdateTM) })} />
        <Button onClick={e => item.Delete(update)}> <DeleteIcon></DeleteIcon></Button>
    </div>
        : null
}
export const SleepStart = () => {
    const [traces, setTraces] = useState<TraceModel[]>([])

    const AddMeasure = (event) => {
        MeasureItem.Recommend("", (list) => { setTraces([...list, ...traces]) })
        var newItem = new TraceModel("0", "", "0")
        setTraces([newItem, ...traces.filter(item => item.traceId !== "0")])
    }
    const AddAction = (event) => {
        ActItem.Recommend("", (list) => { setTraces([...list, ...traces]) })
        var newItem = new TraceModel("0", "0", "")
        setTraces([newItem, ...traces.filter(item => item.traceId !== "0")])
    }
    const getListCallBack = (list: TraceModel[]) => {
        // 记录change的初始值,避免不必要的更新
        //monitor initial value,to avoid unnecessary update
        list.forEach(item => {
            TraceItem.From(item).LocalVersionModified()
            MeasureItem.From(item).LocalVersionModified()
            ActItem.From(item).LocalVersionModified()
        })
        setTraces(list)
    }
    useEffect(() => TraceModel.Get(getListCallBack), [])

    const audioref = createRef<HTMLMediaElement>()

    const [volume, setVolume] = useState<number>(0.7)
    const [play, setPlay] = useState(true)
    const { HeartRate, setHeartRate } = useContext(GlobalContext)
    useEffect(() => {
        if (!!audioref.current && HeartRate > 0 && (new Date().getTime() - lastPlay) > 3000)
            audioref.current.play()
    }, [HeartRate, audioref])
    const Replay = () => {
        if (HeartRate === 0) return
        if (!play) return
        let now = new Date().getTime()
        let shouldPlay: number = 60000 / Math.max(20, HeartRate) + lastPlay
        let wait = shouldPlay - now
        wait = lastWaitTime * 0.2 + wait * 0.8
        lastWaitTime = wait
        console.log("wait", wait, "HeartRate", HeartRate, "playbackRate", audioref.current.playbackRate, "span", 60000 / Math.max(20, HeartRate), HeartRate)
        lastPlay = now
        audioref.current.volume = volume
        if (wait <= 0) {
            audioref.current.playbackRate *= 1.1
            audioref.current.play()
        } else {
            if (wait > 200) {
                audioref.current.playbackRate *= 0.9
            }
            setTimeout(e => (document.getElementById("myAudio") as HTMLMediaElement).play(), wait)
        }
    }
    return (
        //items table ,all columes are sortable, contains a list of items
        <div style={{ ...cv0, height: "100%", width: '100%', justifyContent: "space-between" }}>
            <Container maxWidth="lg" style={{ margin: ".5em 0 .5em 0 " }}>
                <SelectBluetoothHeartrateDevice />    <span style={{ margin: "0 1em 0 1em" }}>  </span>  <SelectBlueToothAccelerometer />
            </Container>
            <audio ref={audioref}
                id={`myAudio`} key="myAudio"
                src={base64EncodedMp3}
                onPause={e => Replay()}
                preload="true"
                loop={false}
            ></audio>
            {/* <BackGroundPlayer></BackGroundPlayer> */}
            <Button variant="contained" size="large" color={!play ? "primary" : "secondary"} sx={{ p: "0.5em 3em 0.5em 3em" }} onClick={e => setPlay(!play)} >
                {play ? `禁用心跳声音` : "启用心跳声音"}
            </Button>
            {/* <MusicPlayerSlider></MusicPlayerSlider> */}
            <AccelerometerTrain key="AccelerometerTrain"></AccelerometerTrain>

            <div className="cv0" style={{ justifyContent: "flex-start" }} >
                {traces.map((item, i) => <TraceModelItem key={`trace-${item["traceId"]}-${item["name"]}-${item["updated"]}`} item={item} />)}
            </div>
        </div>
    );
}