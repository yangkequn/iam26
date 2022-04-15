package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/milvus"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureRecommendGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureRecommendGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureRecommendGetLogic {
	return &MeasureRecommendGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *MeasureRecommendGetLogic) MeasureRecommendGet(req *types.TextRequest) (resp *types.List, err error) {
	var (
		Ids []int64
	)
	meaning, errM := Tool.TextToMeaning(l.ctx, l.svcCtx.RedisClient, req.Text)
	if errM != nil {
		return nil, errM
	}

	Ids, _, err = milvus.MeasureCollection.Search(l.ctx, meaning)

	return &types.List{List: Tool.Int64ArrayToStringArray(Ids)}, err
}
