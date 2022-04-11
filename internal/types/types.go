// Code generated by goctl. DO NOT EDIT.
package types

type TextRequest struct {
	Text string `form:"text,optional"`
}

type FormId struct {
	Id string `form:"id"`
}

type List struct {
	List []string `json:"list"`
}

type ActItem struct {
	ActId      string  `json:"actId"`
	Name       string  `json:"name"`
	Unit       string  `json:"unit"`
	Detail     string  `json:"detail"`
	Popularity int64   `json:"popularity,optional"`
	Score      float32 `json:"score,optional"`
	Mine       bool    `json:"mine"`
}

type MeasureItem struct {
	MeasureId  string  `json:"measureId"`
	Name       string  `json:"name"`
	Unit       string  `json:"unit"`
	Detail     string  `json:"detail"`
	Popularity int64   `json:"popularity,optional"`
	Score      float32 `json:"score,optional"`
	Mine       bool    `json:"mine"`
}

type GoalItem struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	Detail     string `json:"detail"`
	Risk       string `json:"risk"`
	Benifites  string `json:"benifites"`
	Popularity int64  `json:"popularity"`
	Mine       bool   `json:"mine"` //if this goal is setted as my goal
}

type TraceItem struct {
	TraceId   string  `json:"traceId"`
	ActId     string  `json:"actId"`
	MeasureId string  `json:"measureId"`
	Value     float64 `json:"value"`
	Memo      string  `json:"memo"`
	Time      int64   `json:"time"`
}
