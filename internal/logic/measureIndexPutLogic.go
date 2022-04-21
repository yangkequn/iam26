package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureIndexPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureIndexPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureIndexPutLogic {
	return &MeasureIndexPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *MeasureIndexPutLogic) MeasureIndexPut(req *types.MeasureIndex) (resp *types.MeasureIndex, err error) {
	// todo: add your logic here and delete this line

	return
}
