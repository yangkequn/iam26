package logic

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type TraceItemPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewTraceItemPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *TraceItemPutLogic {
	return &TraceItemPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *TraceItemPutLogic) TraceItemPut(req *types.TraceItem) (resp *types.TraceItem, err error) {

	//login is required, get user id from jwt token
	uid, errUid := UID(l.ctx)
	if errUid != nil {
		return nil, errUid
	}

	ActId, MeasureId, TraceItemId := GoTools.StringToInt64(req.ActId), GoTools.StringToInt64(req.MeasureId), GoTools.StringToInt64(req.TraceId)
	if ActId^MeasureId == 0 {
		return nil, fmt.Errorf("MeasureId id or ActId is required")
	} else if MeasureId != 0 && ActId != 0 {
		return nil, fmt.Errorf("only one of MeasureId or ActId is required")
	}

	// get one record model.Trace from db
	trace, err := l.svcCtx.TraceListModel.FindOne(l.ctx, uid)
	//create new model.Trace if not exist
	if NoRowsInResultSet(err) {
		trace = &model.TraceList{Id: uid}
		_, err = l.svcCtx.TraceListModel.Insert(l.ctx, trace)
	}
	if err != nil {
		return nil, err
	}
	traceItem := &model.TraceItem{}
	// TraceItemId ==0 means create new record
	if TraceItemId == 0 {
		//set traceItem according to req
		traceItem.Id = rand.Int63()
		traceItem.UserId = uid
		traceItem.ActId = ActId
		traceItem.MeasureId = MeasureId
		traceItem.Value = req.Value
		traceItem.Time = time.Unix(req.Time, 0)

		// insert new record
		_, err = l.svcCtx.TraceItemModel.Insert(l.ctx, traceItem)
		if err != nil {
			return nil, err
		}

		//append to TraceItem Ids
		GoTools.NonRedundantMerge(&trace.List, GoTools.Int64ToString(traceItem.Id), true)
		l.svcCtx.TraceListModel.Update(l.ctx, trace)

	} else {
		//existing record,update traceItem
		traceItem, err = l.svcCtx.TraceItemModel.FindOne(l.ctx, TraceItemId)
		if err != nil {
			return nil, err
		}
		traceItem.ActId = ActId
		traceItem.MeasureId = MeasureId
		traceItem.Value = req.Value
		traceItem.Memo = req.Memo
		traceItem.Time = time.Unix(req.Time, 0)
		//update record
		err = l.svcCtx.TraceItemModel.Update(l.ctx, traceItem)
		if err != nil {
			return nil, err
		}
	}

	return ConvertTraceItemModel2TraceItem(traceItem), nil
}

//convert int64 to byte[]
func Convert(ids []int64) (data []byte) {
	for _, id := range ids {
		data = append(data, byte(id))
	}
	return data
}

//encode byte[] to  int64[] , data is littenEndian encoed
func Encode(data []byte) (ids []int64) {
	for i := 0; i < len(data); i++ {
		ids = append(ids, int64(data[i]))
	}
	return ids
}
func ConvertTraceItemModel2TraceItem(traceItem *model.TraceItem) *types.TraceItem {
	ret := &types.TraceItem{
		TraceId:   GoTools.Int64ToString(traceItem.Id),
		ActId:     GoTools.Int64ToString(traceItem.ActId),
		MeasureId: GoTools.Int64ToString(traceItem.MeasureId),
		Value:     traceItem.Value,
		Time:      traceItem.Time.Unix(),
		Memo:      traceItem.Memo,
	}
	//actId, measureId, 为0 的，返回空值，用以指示ID不使用
	if traceItem.ActId == 0 {
		ret.ActId = ""
	}
	if traceItem.MeasureId == 0 {
		ret.MeasureId = ""
	}
	if traceItem.Id == 0 {
		ret.TraceId = ""
	}
	return ret
}
