// Code generated by goctl. DO NOT EDIT.

export interface TextRequest {
}

export interface TextRequestParams {
	text: string
}

export interface FormId {
}

export interface FormIdParams {
	id: string
}

export interface ActItem {
	actId: string
	name: string
	unit: string
	detail: string
	popularity?: number
	score?: number
}

export interface MeasureItem {
	measureId: string
	name: string
	unit: string
	detail: string
	popularity?: number
	score?: number
}

export interface GoalItem {
	id: string
	name: string
	markdown: string
	weight: number
	risk: string
	popularity: number
}

export interface TraceItem {
	traceId: string
	actId: string
	measureId: string
	value: number
	memo: string
	time: number
}

