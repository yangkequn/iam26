import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { MeasureItem } from "../models/MeasureItem";
import {  Field2DivInnerText } from "../base/BindModelComponent";
import { Field2RichText } from "../base/EditorSlate";
//export interface IMeasureItem { measureId: string; name: string; unit: string; detail: string; popularity: number; score: number; }
export function MeasureItemComponent({ item }: { item: MeasureItem }) {
    const [updateTM, setUpdateTM] = useState<number>(new Date().getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { item.Load(Refresh) }, [])
    const Refresh = e => setUpdateTM(new Date().getTime())
    const Events = {
        onBlur: function (event: Event): void { item.Put(Refresh); },
    }
    const LeftPanel = <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: "20%" }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography  variant="h6" component="div" key={`name${updateTM}`} sx={{ bgcolor: item.mine ? "pink" : null }}>
                名称/单位  {item.mine && <CheckBoxIcon />} </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div"> 描述 </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div"> 采用: {item.popularity}</Typography>
        </CardContent>

    </Box>
    const RightPanel = <Box key={`NameDetail${updateTM}`} sx={{ width: "100%", textAlign:"left",}}>
        <Box sx={{display:"flex",flexDirection:"row",width:"100%"}}>
        <Typography component="div" variant="h5" key={`name${updateTM}`}   sx={{width: "100%",}}>
            <Field2DivInnerText model={item} field="name" updateKey={updateTM} callbacks={Events} placeholder="输入评估名称" />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" component="div"  sx={{width: "100%",}}>
            <Field2DivInnerText model={item} field="unit" updateKey={updateTM} callbacks={Events} placeholder="输入单位" />
        </Typography>

        </Box>
        <Typography variant="subtitle1"  component="div" sx={{width: "100%",}} >
            <Field2RichText model={item} field="detail" updateKey={updateTM} callbacks={Events} placeholder="输入详情" autoFocus={false} />
        </Typography>
    </Box>
    return !!item.measureId ? <Card sx={{ display: 'flex', mb: item.IsNew() ? "1.0em" : "0.5em" }} >
        {LeftPanel}
        {RightPanel}
    </Card> : null
}


export const Measure = () => {
    const [measureItems, setMeasureItems] = useState<MeasureItem[]>([new MeasureItem("0", "", "", "", 0, 0, false)])

    useEffect(() => {
        MeasureItem.Recommend("", list => setMeasureItems([...(measureItems.filter((item: MeasureItem) => item.IsNew())), ...list]))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <Container maxWidth="xl" sx={{ height: "100%" }} id="measure Panel">
        <Box sx={{ mt: "0.5em" }} >
            {measureItems.map((item, index) => <MeasureItemComponent key={`measure_${item.measureId}`} item={item} />)}
        </Box>
    </Container>
}