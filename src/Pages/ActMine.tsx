import React, { useState, useEffect } from "react";
import { cr0 } from "../base/css";
import { ActItem } from "../models/ActItem";
import TextField from '@mui/material/TextField';
import { Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { BindTextFieldModel as bind } from "../base/BindModelComponent";

//export interface IActItem { actId: string; name: string; unit: string; detail: string; popularity: number; score: number; }
function MyActItemComponent({ item }: { item: ActItem }) {
    const [updateTM, setUpdateTM] = useState<number>(new Date().getTime())
    const onChange = (e) => item.Put(setUpdateTM)
    return !!item.actId ? <div className={`cr0`} key={`GoalItemComponent${updateTM}`} >
        <TextField required label="名称" variant="standard" key={`${updateTM}_name`}
            {...bind(item, "name", { onBlur: onChange })} />
        <TextField label="单位" variant="standard" key={`${updateTM}_unit`}
            {...bind(item, "unit", { onBlur: onChange })} />
        <TextField required label="描述" variant="filled" key={`${updateTM}_detail`}
            {...bind(item, "detail", { onBlur: onChange })} />
        <TextField label="相关性" variant="filled" key={`${updateTM}_score`}
            {...bind(item, "score", { onBlur: onChange })} />
        <TextField label="使用次数" type="datetime-local" variant="standard" InputLabelProps={{ shrink: true, }}
            key={`${updateTM}_popularity`}
            {...bind(item, "popularity", { onBlur: onChange })} />
        <Button onClick={e => item.Delete(setUpdateTM)}> <DeleteIcon></DeleteIcon></Button>
    </div> : null
}

export function MyAct() {
    
    const [actItems, setActItems] = useState<ActItem[]>([])

    useEffect(() => {
        ActItem.Recommend("", setActItems)
        return () => { }
    }, [])


    // let Item = (id, name, unit, value, detail) => ({ id, name, unit, value, detail })
    // let items = [Item(0, "高压氧", "分钟", "30"), Item(1, "饮食", "腹饱感", "7分饱")]

    return <div style={cr0}>
        <div >
            {actItems.map((item, index) => <MyActItemComponent key={`measure_${item.actId}`} item={item} />)}
        </div>
    </div>
}