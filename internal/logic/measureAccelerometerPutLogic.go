package logic

import (
	"context"
	"fmt"
	"iam26/internal/svc"
	"iam26/internal/types"
	"math"
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
	var (
		oldItems []int64
	)
	startTime, endTime := data[0], data[1]
	//read old data from redis,if new data is continuous data of the old one, and total data point is more than 30 seconds, then return total data
	//else remove old data,and reserve new data only
	oldDataStr, _ := l.svcCtx.RedisClient.Get(l.ctx, "HB:"+uid).Result()
	if oldItems, err = Tool.Base10StringToInt64Array(oldDataStr); err != nil {
		return "", err
	}

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
		uid       string
		data      []int64
		heartbeat float32
	)
	req.Data, err = Decompress(req.Data, "")

	if data = Tool.StringToInt64Array(req.Data); err != nil {
		l.Errorf("lzstring.DecompressFromEncodedUriComponent err:%v", err)
		return nil, err
	}
	if len(data) < 30 {
		return nil, fmt.Errorf("too less data points")
	}
	if len(data)%3 != 0 {
		return nil, fmt.Errorf("data format corrupt")
	}
	startTime, endTime := data[0], data[1]
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
	heartbeat, _ = Tool.QueryHeartBeat(l.ctx, data)

	//未被标记数据，无需保存到数据库

	return &types.PutMeasureAccelerometer{Heartbeat: int64(heartbeat)}, nil
}
