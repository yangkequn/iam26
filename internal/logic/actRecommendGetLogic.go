package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/milvus"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type ActRecommendGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewActRecommendGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ActRecommendGetLogic {
	return &ActRecommendGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ActRecommendGetLogic) ActRecommendGet(req *types.TextRequest) (resp *types.List, err error) {
	var (
		Ids     []int64
		meaning []float32
	)
	meaning, err = GoTools.TextToMeaning(l.ctx, l.svcCtx.RedisClient, req.Text)
	if err != nil {
		return nil, err
	}

	//get act list from milvus Search
	Ids, _, err = milvus.ActCollection.Search(l.ctx, meaning)
	if err != nil {
		return nil, err
	}
	return &types.List{List: GoTools.Int64ArrayToStringArray(Ids)}, err
}
