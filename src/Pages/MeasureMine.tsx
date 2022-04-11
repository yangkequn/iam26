import React, { useState, useEffect } from "react";
import { MeasureItem } from "../models/MeasureItem";
import {MeasureItemComponent} from "./MeasureAdd";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export const MyMeasure = () => {
    const [measureItems, setMeasureItems] = useState<MeasureItem[]>([])

    useEffect(() => {
        MeasureItem.MyList(setMeasureItems)
        return () => { }
    }, [])


    // let Item = (id, name, unit, value, detail) => ({ id, name, unit, value, detail })
    // let items = [Item(0, "高压氧", "分钟", "30"), Item(1, "饮食", "腹饱感", "7分饱")]

    return <Container maxWidth="xl" sx={{ height: "100%" }} id="measure Panel">
    <Box sx={{ mt: "0.5em" }} >
        {measureItems.map((item, index) => <MeasureItemComponent key={`measure_${item.measureId}`} item={item} />)}
    </Box>
</Container>
}