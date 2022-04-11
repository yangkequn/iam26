import React, { useState, useEffect } from "react";
import { GoalItem } from "../models/GoalItem";
import { BindTextFieldModel as bind } from "../base/BindModelComponent";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {GoalItemComponent} from './goalAdd';
export const MyGoals = () => {
  const [goalItems, setGoalItems] = useState<GoalItem[]>([])

    useEffect(() => {
        GoalItem.MyList(setGoalItems)
        return () => { }
    }, [])

    //display goalItems stored in goalItems in multiple rows
    return <Container maxWidth="xl" sx={{ height: "100%" }} id="goalPanel">
        <Box sx={{ mt: "0.5em" }} >
            {goalItems.map((item, index) => <GoalItemComponent key={`goal_${item.id}`} item={item} />)}
        </Box>
    </Container>
}