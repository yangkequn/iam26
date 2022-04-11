import React, { useState, useEffect } from "react";
import { ActItem } from "../models/ActItem";
import { BindTextFieldModel as bind } from "../base/BindModelComponent";
import {Container, Box, Button} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {  Field2DivInnerText} from "../base/BindModelComponent";
import { Field2RichText, Field2PainText } from "../base/EditorSlate";


//export interface IActItem { actId: string; name: string; unit: string; detail: string; popularity: number; score: number; }
export function ActItemComponent({ item }: { item: ActItem }) {
    const theme = useTheme();
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
            <Field2DivInnerText model={item} field="name" updateKey={updateTM} callbacks={Events} placeholder="输入措施名称" />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" component="div"  sx={{width: "100%",}}>
            <Field2DivInnerText model={item} field="unit" updateKey={updateTM} callbacks={Events} placeholder="输入单位" />
        </Typography>

        </Box>
        <Typography variant="subtitle1"  component="div" sx={{width: "100%",}} >
            <Field2RichText model={item} field="detail" updateKey={updateTM} callbacks={Events} placeholder="输入详情" autoFocus={false} />
        </Typography>
    </Box>
    return !!item.actId ? <Card sx={{ display: 'flex', mb: item.IsNew() ? "1.0em" : "0.5em" }} >
        {LeftPanel}
        {RightPanel}
    </Card> : null
}



export function Act() {
    
    const [items, setItems] = useState<ActItem[]>([new ActItem("0", "", "", "", 0, 0, false)])

    useEffect(() => {
        ActItem.Recommend("", list => setItems([...(items.filter((item: ActItem) => item.IsNew())), ...list]))
        return () => { }
    }, [])


    // let Item = (id, name, unit, value, detail) => ({ id, name, unit, value, detail })
    // let items = [Item(0, "高压氧", "分钟", "30"), Item(1, "饮食", "腹饱感", "7分饱")]

    return <Container maxWidth="xl" sx={{ height: "100%" }} id="act Panel">
    <Box sx={{ mt: "0.5em" }} >
    {items.map((item, index) => <ActItemComponent key={`act_${item.actId}`} item={item} />)}
    </Box>
    </Container>
}