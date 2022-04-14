package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type TraceGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewTraceGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *TraceGetLogic {
	return &TraceGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *TraceGetLogic) TraceGet() (resp []types.TraceItem, err error) {
	//login is required, get user id from jwt token
	uid, errUid := UID(l.ctx)
	if errUid != nil {
		return nil, errUid
	}
	// get one record model.Trace from db
	trace, err := l.svcCtx.TraceListModel.FindOne(l.ctx, uid)
	if err != nil {
		return nil, err
	}

	itemIDs := GoTools.StringSlit(trace.List)

	// get all items from db
	for _, id := range itemIDs {
		item, err := l.svcCtx.TraceItemModel.FindOne(l.ctx, id)
		if err != nil {
			return nil, err
		}
		// accesiblity check
		if item.UserId != uid {
			continue
		}

		// convert items to types.TraceItem array
		resp = append(resp, types.TraceItem{
			TraceId:   id,
			ActId:     item.ActId,
			MeasureId: item.MeasureId,
			Value:     item.Value,
			Time:      item.Time.Unix(),
			Memo:      item.Memo,
		})
		//actId, measureId, 为0 的，返回空值，用以指示ID不使用
		if len(item.ActId) == 0 {
			resp[len(resp)-1].ActId = ""
		}
		if len(item.MeasureId) == 0 {
			resp[len(resp)-1].MeasureId = ""
		}
	}

	return resp, nil
}
