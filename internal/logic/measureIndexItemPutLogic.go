package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureIndexItemPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureIndexItemPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureIndexItemPutLogic {
	return &MeasureIndexItemPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *MeasureIndexItemPutLogic) MeasureIndexItemPut(req *types.MeasureIndexItem) (resp *types.MeasureIndexItem, err error) {
	// todo: add your logic here and delete this line

	return
}
