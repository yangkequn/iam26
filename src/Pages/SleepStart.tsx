import React, { createRef, useEffect, useState, useContext } from "react";
import "../base/css.css"
import "./MyTrace.css";
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import { Button } from "@mui/material";
import { cv0 } from "../base/css";
import { TraceModel } from "../models/TraceModel";
import { MeasureItem } from "../models/MeasureItem";
import { ActItem } from "../models/ActItem";
import { TraceItem } from "../models/TraceItem";
import DeleteIcon from '@mui/icons-material/Delete';
import { AccelerometerTrain } from "../base/AccelerometerTrain";
import { SelectBlueToothAccelerometer } from "../device/SelectBlueToothAccelerometer"
import { SelectBluetoothHeartrateDevice } from "../device/SelectBluetoothHeartrateDevice";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { BackGroundPlayer } from "../device/SleepBackGroudPlayer"; 
import { GlobalContext } from "../base/GlobalContext";
import {RecorderComponent} from "../device/recorder"; 
import { unixTime } from "../base/Fuctions";
import { time } from "console";
import { BindTextFieldModel as bind } from "../base/BindModelComponent";
import { HearbeatPlayer } from "../device/HearbeatPlayer";

function TraceModelItem({ item }: { item: TraceModel; }) {

    //monitor initial value,to avoid unnecessary update
    const [updateTM, setUpdateTM] = useState<number>(new Date().getTime())
    const update = () => setUpdateTM(new Date().getTime())

    //autoload from server
    useEffect(() => {
        !!item.measureId && MeasureItem.From(item).Load(() => setUpdateTM(new Date().getTime()))
        !!item.actId && ActItem.From(item).Load(() => setUpdateTM(new Date().getTime()))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item])
    //    useEffect(() => setUpdateTM(new Date().getTime()), [item.updated])


    let TypeText = (!!item["measureId"] && "效果") || (!!item["actId"] && "方法")

    return !!item.traceId && !!updateTM ? <div className={`cr0 trace ${!!item["measureId"] && "traceMeasure"}`}  >
        <div className={"traceIcon"} > {TypeText} </div>
        {/* <TextField className="traceText" required label="名称" variant="standard" {...{defaultValue: item["name"]}}  /> */}
        <TextField className="traceText" required label="名称" variant="standard" key={`${updateTM}_name`}
            {...bind(item, "name", { onBlur:() => item.Save(setUpdateTM) })} />
        <TextField className="traceText" required label="单位" variant="filled" key={`${updateTM}_unit`}
            {...bind(item, "unit", { onBlur:() => item.Save(setUpdateTM) })} />
        <TextField className="traceText" label="细节" variant="standard" key={`${updateTM}_detail`}
            {...bind(item, "detail", { onBlur:() => item.Save(setUpdateTM) })} />
        <TextField className="traceText" label="值" variant="filled" key={`${updateTM}_value`}
            {...bind(item, "value", { onBlur:() => item.Save(setUpdateTM) })} />
        <TextField className="traceText" label="" type="datetime-local" variant="standard" InputLabelProps={{ shrink: true, }}
            {...bind(item, "time", { onBlur:() => item.Save(setUpdateTM) })} />
        <TextField className="traceText" label="备注" variant="filled" key={`${updateTM}_memo`}
            {...bind(item, "memo", { onBlur:() => item.Save(setUpdateTM) })} />
        <Button onClick={() => item.Delete(update)}> <DeleteIcon></DeleteIcon></Button>
    </div>
        : null
}
export const SleepStart = () => {
    const [traces, setTraces] = useState<TraceModel[]>([])

    const AddMeasure = () => {
        MeasureItem.Recommend("", (list:any) => { setTraces([...list, ...traces]) })
        var newItem = new TraceModel("0", "", "0")
        setTraces([newItem, ...traces.filter(item => item.traceId !== "0")])
    }
    const AddAction = () => {
        ActItem.Recommend("", (list:any) => { setTraces([...list, ...traces]) })
        var newItem = new TraceModel("0", "0", "")
        setTraces([newItem, ...traces.filter(item => item.traceId !== "0")])
    }
    const getListCallBack = (list: TraceModel[]) => {
        // 记录change的初始值,避免不必要的更新
        //monitor initial value,to avoid unnecessary update
        list.forEach((item:TraceModel) => {
            TraceItem.From(item).LocalVersionModified()
            MeasureItem.From(item).LocalVersionModified()
            ActItem.From(item).LocalVersionModified()
        })
        setTraces(list)
    }
    useEffect(() => TraceModel.Get(getListCallBack), [])

    return (
        //items table ,all columes are sortable, contains a list of items
        <div style={{ ...cv0, height: "100%", width: '100%', justifyContent: "space-between" }}>
            <Container maxWidth="lg" style={{ margin: ".5em 0 .5em 0 " }}>
                <SelectBluetoothHeartrateDevice />    <span style={{ margin: "0 1em 0 1em" }}>  </span>  <SelectBlueToothAccelerometer />
            </Container>

            <RecorderComponent></RecorderComponent>
            <HearbeatPlayer></HearbeatPlayer>
            {/* <MusicPlayerSlider></MusicPlayerSlider> */}
            <AccelerometerTrain key="AccelerometerTrain"></AccelerometerTrain>

            <div className="cv0" style={{ justifyContent: "flex-start" }} >
                {traces.map((item, i) => <TraceModelItem key={`trace-${item["traceId"]}-${item["name"]}`} item={item} />)}
            </div>
        </div>
    );
}