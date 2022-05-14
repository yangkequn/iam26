package logic

import (
	"context"
	"fmt"
	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"
	"math"
	"math/rand"
	"time"

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

const tm1year = 365 * 24 * 60 * 60 * 1000
const tm1hour = 60 * 60 * 1000
const tm30seconds = 30 * 1000

//SyncWithRedis 将数据同步到redis.
//返回的saveToDBData要求保存到数据库，仅仅每30秒需要保存一次
func (l *MeasureAccelerometerPutLogic) SyncWithRedis(uid string, data []int64) (saveToDBStr string, err error) {
	startTime, endTime := data[0], data[1]
	//read old data from redis,if new data is continuous data of the old one, and total data point is more than 30 seconds, then return total data
	//else remove old data,and reserve new data only
	oldDataStr, _ := l.svcCtx.RedisClient.Get(l.ctx, "HB:"+uid).Result()
	oldItems := Tool.Base10StringToInt64Array(oldDataStr)
	//if current data is not continuous data of the old one,remove old one
	if len(oldItems) > 3 && (math.Abs(float64(oldItems[1]-startTime)) > 200) {
		oldItems = []int64{}
	}
	//merge current data with old data,else curData unchanged
	if len(oldItems) > 0 {
		data = append(oldItems, data[3:]...)
		data[1] = endTime
		data[2] = int64(len(data))
		startTime = data[0]
	}

	//if total time more than 30 seconds,then return total data
	if endTime-startTime > (tm30seconds - 200) {
		l.svcCtx.RedisClient.Del(l.ctx, "HB:"+uid)
		saveToDBStr = Tool.Int64ArrayToBase10String(data)
	} else {
		//save to redis
		l.svcCtx.RedisClient.Set(l.ctx, "HB:"+uid, Tool.Int64ArrayToBase10String(data), time.Second*30)
		saveToDBStr = ""
	}
	return saveToDBStr, nil
}

func (l *MeasureAccelerometerPutLogic) MeasureAccelerometerPut(req *types.MeasureAccelerometer) (resp *types.PutMeasureAccelerometer, err error) {
	var (
		accelerometer           *model.MeasureAccelerometer
		uid                     string
		heartbeat               float32
		DataStrNeededToSaveToDB string
	)
	if len(req.Data)%3 != 0 {
		return nil, fmt.Errorf("data format corrupt")
	}
	if len(req.Data) < 30 {
		return nil, fmt.Errorf("too less data points")
	}
	startTime, endTime := req.Data[0], req.Data[1]
	//时间戳检查
	if startTime <= 0 || startTime < tm1year {
		return nil, fmt.Errorf("start time format error")
	}
	if endTime < startTime || endTime-startTime > tm1hour || endTime < tm1year {
		return nil, fmt.Errorf("end time format error")
	}

	//login is required, get user id from jwt token
	if uid, err = Tool.UserIdFromContext(l.ctx); err != nil {
		return nil, err
	}

	if req.Id == "0" {
		req.Id = uid
	}

	//calculate heartbeat before curData is changed
	heartbeat, _ = Tool.QueryHeartBeat(l.ctx, req.Data)
	//if data is save to redis,and no need save to db ,just return heartbeat
	if DataStrNeededToSaveToDB, err = l.SyncWithRedis(uid, req.Data); DataStrNeededToSaveToDB != "" {
		return &types.PutMeasureAccelerometer{Heartbeat: int64(heartbeat)}, nil
	}

	req.Data = Tool.Base10StringToInt64Array(DataStrNeededToSaveToDB)
	if accelerometer, err = l.svcCtx.MeasureAccelerometerModel.FindOne(l.ctx, req.Id); err != nil && !NoRowsInResultSet(err) {
		return nil, err
	}
	//is measure not created
	if err != nil && NoRowsInResultSet(err) {
		accelerometer = &model.MeasureAccelerometer{Id: req.Id}
		_, err = l.svcCtx.MeasureAccelerometerModel.Insert(l.ctx, accelerometer)
	}
	//TIME_STAMP采样每个时刻一个点
	Tool.MergeStringWithString(&accelerometer.Data, DataStrNeededToSaveToDB, false)
	//merge data to the last list, if the last list's data is not too enough
	//尝试填充到上一张表，直到记录大小超过2M
	if len(accelerometer.Data) > 32*1024 && len(accelerometer.List) > 0 {
		ids := Tool.StringSlit(accelerometer.List)
		last, err := l.svcCtx.MeasureAccelerometerModel.FindOne(l.ctx, ids[len(ids)-1])
		if err == nil && len(last.Data) < 2*1024*1024 {
			Tool.MergeStringWithString(&last.Data, accelerometer.Data, false)
			l.svcCtx.MeasureAccelerometerModel.Update(l.ctx, last)
			accelerometer.Data = ""
		}
	}
	// try create another list to hold the data. temporary data should be short enough,to speed up reading process
	if len(accelerometer.Data) > 32*1024 {
		//copy accelerometer to another
		accelerometer2 := &model.MeasureAccelerometer{
			Id:   Tool.Int64ToString(rand.Int63()),
			Data: accelerometer.Data,
		}
		_, err = l.svcCtx.MeasureAccelerometerModel.Insert(l.ctx, accelerometer2)
		if err == nil {
			accelerometer.Data = ""
			Tool.MergeStringWithString(&accelerometer.List, accelerometer2.Id, false)
		}
	}
	err = l.svcCtx.MeasureAccelerometerModel.Update(l.ctx, accelerometer)

	//convert to response
	return &types.PutMeasureAccelerometer{Heartbeat: int64(heartbeat)}, nil
}
