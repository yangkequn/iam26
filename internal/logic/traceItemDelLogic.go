package logic

import (
	"context"
	"fmt"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type TraceItemDelLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewTraceItemDelLogic(ctx context.Context, svcCtx *svc.ServiceContext) *TraceItemDelLogic {
	return &TraceItemDelLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *TraceItemDelLogic) TraceItemDel(req *types.TraceItem) (resp *types.TraceItem, err error) {
	var (
		uid       string
		traceItem *model.TraceItem
		traceList *model.TraceList
	)

	// check if the record exists
	if traceItem, err = l.svcCtx.TraceItemModel.FindOne(l.ctx, req.TraceId); err != nil {
		return nil, err
	}

	//ensure: 1.login is required, 2.  the user is the owner
	if uid, err = UID(l.ctx); err != nil || traceItem.UserId != uid {
		return nil, fmt.Errorf("you are not the owner of this record")
	}

	// delete traceItem from db
	if err = l.svcCtx.TraceItemModel.Delete(l.ctx, req.TraceId); err != nil {
		return nil, err
	}

	// remove id from trace.history
	if traceList, err = l.svcCtx.TraceListModel.FindOne(l.ctx, uid); err != nil {
		return nil, err
	}
	//remove id from history, and update
	if removed := GoTools.RemoveItemFromString(&traceList.List, req.TraceId); removed {
		if err = l.svcCtx.TraceListModel.Update(l.ctx, traceList); err != nil {
			return nil, err
		}
	}

	// unset traceItem.TraceId
	traceItem.Id = ""
	return ConvertTraceItemModel2TraceItem(traceItem), nil
}
