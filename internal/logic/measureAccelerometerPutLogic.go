package logic

import (
	"context"
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

func (l *MeasureAccelerometerPutLogic) MeasureAccelerometerPut(req *types.MeasureIndex) (resp *types.MeasureIndex, err error) {
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

	Tool.MergeStringWithString(&accelerometer.Data, Tool.Float32ArrayToString(req.Data), false)
	Tool.MergeStringWithString(&accelerometer.Time, Tool.Int64ArrayToString(req.Time), false)

	//if list to long, save it to another row
	if len(accelerometer.Data) > 1024*1024 {
		copy := accelerometer
		//generate random id
		copy.Id = Tool.Int64ToString(rand.Int63())
		go l.svcCtx.MeasureAccelerometerModel.Insert(l.ctx, copy)
		Tool.MergeStringWithString(&accelerometer.List, copy.Id, false)
	}
	go l.svcCtx.MeasureAccelerometerModel.Update(l.ctx, accelerometer)

	//convert to response
	resp = &types.MeasureIndex{
		Id:   accelerometer.Id,
		Data: Tool.StringToFloat32Array(accelerometer.Data),
		//decode time
		Time: Tool.UnixTimeStringToArray_ms(accelerometer.Time),
		List: Tool.StringSlit(accelerometer.List),
	}
	return resp, nil
}
