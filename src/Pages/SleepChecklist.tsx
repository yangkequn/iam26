import React, { useEffect, useState } from "react";
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

export const SleepChecklist = () => {
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


    return (
        //items table ,all columes are sortable, contains a list of items
        <div style={{ ...cv0, height: "100%", width: '100%', justifyContent: "space-between" }}>
            <div className="cr0 insert" style={{ background: "white", height: "50px", alignSelf: "flex-start" }}>
                <div style={{ width: "20%" }}></div>
                <Button className="cr0" variant="contained" color="primary" startIcon={<AddIcon />} onClick={AddMeasure}>添加方法</Button>
                <div style={{ width: "30%" }}></div>
                <Button className="cr0" variant="contained" color="primary" startIcon={<AddIcon />} onClick={AddAction}>添加效果</Button>
                <div style={{ width: "20%" }}></div>
            </div>
            <AccelerometerTrain key="AccelerometerTrain"></AccelerometerTrain>

            <div className="cv0" style={{ justifyContent: "flex-start" }} >
                {traces.map((item, i) => <TraceModelItem key={`trace-${item["traceId"]}-${item["name"]}-${item["updated"]}`} item={item} />)}
            </div>
        </div>
    );
}