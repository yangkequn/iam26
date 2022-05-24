package logic

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureHeartRatePutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureHeartRatePutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureHeartRatePutLogic {
	return &MeasureHeartRatePutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}
func MaxInt(x, y int) int {
	if x > y {
		return x
	}
	return y
}
func (l *MeasureHeartRatePutLogic) MeasureHeartRatePut(req *types.HeartRatePut) (resp *types.HeartRateHistory, err error) {
	// todo: add your logic here and delete this line
	var (
		uid                           string
		heartrateHistory, lastHistory *model.HeartRateHistory
		history                       []int64
	)

	if uid, err = Tool.UserIdFromContext(l.ctx); err != nil {
		return nil, err
	}
	if req.HeartRate < 30 || req.HeartRate > 220 {
		return nil, fmt.Errorf("心率范围为30-220")
	}

	if heartrateHistory, err = l.svcCtx.HeartRateHistory.FindOne(l.ctx, uid); err != nil {
		return nil, err
	}
	//if record does not exist ,create a new record
	if err != nil {
		if NoRowsInResultSet(err) {
			heartrateHistory = &model.HeartRateHistory{Id: uid, List: ""}
			_, err = l.svcCtx.HeartRateHistory.Insert(l.ctx, heartrateHistory)
		}
	}
	if err != nil {
		return nil, err
	}
	//每分钟15个数据点
	now := int64(time.Now().Unix()) >> 2
	Tool.GobDecode(heartrateHistory.Data, &history)
	modified := false
	if req.HeartRate > 0 && history[len(history)-2] != now {
		history = append(history, now)
		history = append(history, int64(req.HeartRate))
		heartrateHistory.Data = Tool.GobEncode(history)
		modified = true
	}
	// if data length too long ,save to another data record,
	// 为最近24小时数据划线
	i := MaxInt(0, len(history)-2)
	for ; i > 0 && (now-history[i] < (24 * 60 * 60 >> 2)); i -= 2 {
	}

	//转储数据
	if i > 16*1024 {
		if len(heartrateHistory.List) > 0 {
			lastList := Tool.StringSlit(heartrateHistory.List)
			listId := lastList[len(lastList)-1]
			if lastHistory, err = l.svcCtx.HeartRateHistory.FindOne(l.ctx, listId); err != nil {
				return nil, err
			}
			//store to last list
			storeToLastList := len(lastHistory.Data) < 2*1024*1024
			if storeToLastList {
				var lastHistoryData []int64
				if err = Tool.GobDecode(lastHistory.Data, &lastHistoryData); err != nil {
					l.Logger.Error(err)
					return nil, err
				}
				lastHistoryData = append(lastHistoryData, history[0:i]...)
				lastHistory.Data = Tool.GobEncode(lastHistoryData)
				if err = l.svcCtx.HeartRateHistory.Update(l.ctx, lastHistory); err != nil {
					return nil, err
				}
			}

			if !storeToLastList {
				//create a new record to hold the data
				listId = Tool.Int64ToString(rand.Int63())

				heartrateHistory = &model.HeartRateHistory{Id: listId, List: "", Data: Tool.GobEncode(history[0:i])}
				_, err = l.svcCtx.HeartRateHistory.Insert(l.ctx, heartrateHistory)

				heartrateHistory.List = heartrateHistory.List + "," + listId
			}
		}
		//create another record,and move the old data to the new record
		heartrateHistory.Data = Tool.GobEncode(history[i:])
		modified = true
	}
	if modified {
		if err = l.svcCtx.HeartRateHistory.Update(l.ctx, heartrateHistory); err != nil {
			return nil, err
		}
	}

	//返回最近一天的数据
	if !req.AskHistroy {
		return &types.HeartRateHistory{History: ""}, nil
	}

	//改为相对时间
	history = history[i:]
	for i := 0; i < len(history); i += 2 {
		history[i] = history[i] - now
	}
	return &types.HeartRateHistory{History: Tool.Int64ArrayToBase10String(history)}, nil
}
