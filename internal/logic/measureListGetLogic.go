package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureListGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureListGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureListGetLogic {
	return &MeasureListGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *MeasureListGetLogic) MeasureListGet() (resp *types.List, err error) {
	var (
		uid         string
		measureList *model.MeasureList
	)
	if uid, err = Tool.UserIdFromContext(l.ctx); err != nil {
		return nil, err
	}
	if measureList, err = l.svcCtx.MeasureListModel.FindOne(l.ctx, uid); err != nil {
		// Auto create measure list
		if NoRowsInResultSet(err) {
			//create new
			measureList = &model.MeasureList{Id: uid}
			l.svcCtx.MeasureListModel.Insert(l.ctx, measureList)
		}
		if err != nil {
			return nil, err
		}

	}
	return &types.List{List: Tool.StringSlit(measureList.List)}, nil
}
