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

	if len(req.ActId) == 0 && len(req.MeasureId) == 0 {
		return nil, fmt.Errorf("MeasureId id or ActId is required")
	} else if len(req.ActId) > 0 && len(req.MeasureId) > 0 {
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
	if req.TraceId == "0" {
		req.TraceId = GoTools.Int64ToString(rand.Int63())
		//set traceItem according to req
		traceItem.Id = req.TraceId
		traceItem.UserId = uid
		traceItem.ActId = req.ActId
		traceItem.MeasureId = req.MeasureId
		traceItem.Value = req.Value
		traceItem.Time = time.Unix(req.Time, 0)

		// insert new record
		_, err = l.svcCtx.TraceItemModel.Insert(l.ctx, traceItem)
		if err != nil {
			return nil, err
		}

		//append to TraceItem Ids
		GoTools.NonRedundantMerge(&trace.List, traceItem.Id, true)
		l.svcCtx.TraceListModel.Update(l.ctx, trace)

	} else {
		//existing record,update traceItem
		traceItem, err = l.svcCtx.TraceItemModel.FindOne(l.ctx, req.TraceId)
		if err != nil {
			return nil, err
		}
		traceItem.ActId = req.ActId
		traceItem.MeasureId = req.MeasureId
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
		TraceId:   traceItem.Id,
		ActId:     traceItem.ActId,
		MeasureId: traceItem.MeasureId,
		Value:     traceItem.Value,
		Time:      traceItem.Time.Unix(),
		Memo:      traceItem.Memo,
	}
	return ret
}
