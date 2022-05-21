package logic

import (
	"context"
	"fmt"
	"math/rand"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureAccelerometerTrainingPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureAccelerometerTrainingPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureAccelerometerTrainingPutLogic {
	return &MeasureAccelerometerTrainingPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *MeasureAccelerometerTrainingPutLogic) MeasureAccelerometerTrainingPut(req *types.MeasureAccelerometer) (err error) {
	var (
		accelerometer           *model.AccelerometerTraining
		uid                     string
		data                    []int64
		DataStrNeededToSaveToDB string
	)

	if req.Data, err = Decompress(req.Data, ""); err != nil {
		return err
	}
	data = Tool.Base10StringToInt64Array(req.Data)

	//若干格式有效性检查
	if err != nil {
		l.Errorf("lzstring.DecompressFromEncodedUriComponent err:%v", err)
		return err
	}
	if len(data) < 30 {
		return fmt.Errorf("too less data points")
	}
	if len(data)%4 != 0 {
		return fmt.Errorf("data format corrupt")
	}
	startTime, endTime := data[0], data[1]
	//时间戳检查
	if startTime <= 0 || startTime < tm1year {
		return fmt.Errorf("start time format error")
	}
	if endTime < startTime || endTime-startTime > tm1hour || endTime < tm1year {
		return fmt.Errorf("end time format error")
	}

	//login is required, get user id from jwt token
	if uid, err = Tool.UserIdFromContext(l.ctx); err != nil {
		return err
	} else {
		req.Id = uid
	}

	//is measure not created
	if accelerometer, err = l.svcCtx.AccelerometerTrainingModel.FindOne(l.ctx, req.Id); err != nil && !NoRowsInResultSet(err) {
		return err
	}
	if err != nil && NoRowsInResultSet(err) {
		accelerometer = &model.AccelerometerTraining{Id: req.Id}
		_, err = l.svcCtx.AccelerometerTrainingModel.Insert(l.ctx, accelerometer)
	}

	DataStrNeededToSaveToDB = Tool.Int64ArrayToBase10String(data)
	//TIME_STAMP采样每个时刻一个点
	Tool.MergeStringWithString(&accelerometer.Data, DataStrNeededToSaveToDB, false)
	//merge data to the last list, if the last list's data is not too enough
	//尝试填充到上一张表，直到记录大小超过2M
	if len(accelerometer.Data) > 32*1024 && len(accelerometer.List) > 0 {
		ids := Tool.StringSlit(accelerometer.List)
		last, err := l.svcCtx.AccelerometerTrainingModel.FindOne(l.ctx, ids[len(ids)-1])
		if err == nil && len(last.Data) < 2*1024*1024 {
			Tool.MergeStringWithString(&last.Data, accelerometer.Data, false)
			l.svcCtx.AccelerometerTrainingModel.Update(l.ctx, last)
			accelerometer.Data = ""
		}
	}
	// try create another list to hold the data. temporary data should be short enough,to speed up reading process
	if len(accelerometer.Data) > 32*1024 {
		//copy accelerometer to another
		accelerometer2 := &model.AccelerometerTraining{
			Id:   Tool.Int64ToString(rand.Int63()),
			Data: accelerometer.Data,
		}
		_, err = l.svcCtx.AccelerometerTrainingModel.Insert(l.ctx, accelerometer2)
		if err == nil {
			accelerometer.Data = ""
			Tool.MergeStringWithString(&accelerometer.List, accelerometer2.Id, false)
		}
	}
	err = l.svcCtx.AccelerometerTrainingModel.Update(l.ctx, accelerometer)

	//convert to response
	return nil
}
