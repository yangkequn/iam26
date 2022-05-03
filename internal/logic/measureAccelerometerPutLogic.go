package logic

import (
	"context"
	"fmt"
	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"
	"math/rand"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureAccelerometerPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureAccelerometerPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureAccelerometerPutLogic {
	return &MeasureAccelerometerPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *MeasureAccelerometerPutLogic) MeasureAccelerometerPut(req *types.MeasureAccelerometer) (resp *types.MeasureAccelerometer, err error) {
	var (
		accelerometer *model.MeasureAccelerometer
		uid           string
	)
	//login is required, get user id from jwt token
	if uid, err = Tool.UserIdFromContext(l.ctx); err != nil {
		return nil, err
	}

	if req.Id == "0" {
		req.Id = uid
	}
	if accelerometer, err = l.svcCtx.MeasureAccelerometerModel.FindOne(l.ctx, req.Id); err != nil && !NoRowsInResultSet(err) {
		return nil, err
	}
	//is measure not created
	if err != nil && NoRowsInResultSet(err) {
		accelerometer = &model.MeasureAccelerometer{Id: req.Id}
		_, err = l.svcCtx.MeasureAccelerometerModel.Insert(l.ctx, accelerometer)
	}
	//TIME_STAMP采样每个时刻一个点
	data := Tool.Int64ArrayToBase10String(req.Data)
	time := Tool.Int64ArrayToBase10String(req.Time)
	if len(Tool.StringSlit(data)) != len(Tool.StringSlit(time))*3 {
		return nil, fmt.Errorf("data and time length not match")
	}
	Tool.MergeStringWithString(&accelerometer.Data, data, false)
	Tool.MergeStringWithString(&accelerometer.Time, time, false)

	//merge data to the last list, if the last list's data is not too enough
	if len(accelerometer.Data) > 32*1024 {
		if len(accelerometer.List) > 0 {
			ids := Tool.StringSlit(accelerometer.List)
			last, err := l.svcCtx.MeasureAccelerometerModel.FindOne(l.ctx, ids[len(ids)-1])
			if err == nil && len(accelerometer.Data) < 2*1024*1024 {
				Tool.MergeStringWithString(&last.Data, accelerometer.Data, false)
				Tool.MergeStringWithString(&last.Time, accelerometer.Time, false)
				accelerometer.Data = ""
				accelerometer.Time = ""
				l.svcCtx.MeasureAccelerometerModel.Update(l.ctx, last)
			}
		}
	}
	// try create another list to hold the data. temporary data should be short enough,to speed up reading process
	if len(accelerometer.Data) > 32*1024 {
		//尝试填充到上一张表，直到记录大小超过1M

		//copy accelerometer to another
		accelerometer2 := &model.MeasureAccelerometer{
			Id:   Tool.Int64ToString(rand.Int63()),
			Data: accelerometer.Data,
			Time: accelerometer.Time,
		}
		_, err = l.svcCtx.MeasureAccelerometerModel.Insert(l.ctx, accelerometer2)
		if err == nil {
			accelerometer.Data = ""
			accelerometer.Time = ""
			Tool.MergeStringWithString(&accelerometer.List, accelerometer2.Id, false)
		}
	}
	err = l.svcCtx.MeasureAccelerometerModel.Update(l.ctx, accelerometer)

	//convert to response
	resp = &types.MeasureAccelerometer{
		Id:   accelerometer.Id,
		Data: Tool.Base10StringToInt64Array(accelerometer.Data),
		//decode time
		Time: Tool.JSTimeSequenceStringToArray(accelerometer.Time),
		List: Tool.StringSlit(accelerometer.List),
	}
	return resp, nil
}
