import React, { useState, useEffect } from "react";
import { GoalItem } from "../models/GoalItem";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Field2DivInnerText } from "../base/BindModelComponent";
import { Field2RichText } from "../base/EditorSlate";

export function GoalItemComponent({ item }: { item: GoalItem }) {
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
              名称  {item.mine && <CheckBoxIcon />} </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div"> 描述 </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div"> 采用: {item.popularity}</Typography>
      </CardContent>

  </Box>
  const RightPanel = <Box key={`NameDetail${updateTM}`} sx={{ width: "100%", textAlign:"left",}}>
      <Box sx={{display:"flex",flexDirection:"row",width:"100%"}}>
      <Typography component="div" variant="h5" key={`name${updateTM}`}   sx={{width: "100%",}}>
          <Field2DivInnerText model={item} field="name" updateKey={updateTM} callbacks={Events} placeholder="输入目标名称" />
      </Typography>

      </Box>
      <Typography variant="subtitle1"  component="div" sx={{width: "100%",}} >
          <Field2RichText model={item} field="detail" updateKey={updateTM} callbacks={Events} placeholder="输入详情" autoFocus={false} />
      </Typography>
  </Box>
  return !!item.id ? <Card sx={{ display: 'flex', mb: item.IsNew() ? "1.0em" : "0.5em" }} >
      {LeftPanel}
      {RightPanel}
  </Card> : null
}


export const GoalAndRisk = () => {

  useEffect(() => {
    //merging creating goal and recommend goal
    GoalItem.Recommend("", (list) => setGoalItems([...(goalItems.filter((item: GoalItem) => item.IsNew())), ...list]))
    return () => { }
  })
  const [goalItems, setGoalItems] = useState<GoalItem[]>([new GoalItem("0", "", "", "", "", 1, true)])

  //display goalItems stored in goalItems in multiple rows
  return <Container maxWidth="xl" sx={{ height: "100%" }} id="goalPanel">
    <Box sx={{ mt: "0.5em" }} >
      {goalItems.map((item, index) => <GoalItemComponent key={`goal_${item.id}`} item={item} />)}
    </Box>
  </Container>
}