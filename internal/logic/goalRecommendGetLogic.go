package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/milvus"
	"iam26/model"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type GoalRecommendGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGoalRecommendGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GoalRecommendGetLogic {
	return &GoalRecommendGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GoalRecommendGetLogic) GoalRecommendGet(req *types.TextRequest) (resp *types.List, err error) {
	var (
		Ids     []int64
		meaning []float32
	)
	meaning, err = Tool.TextToMeaning(l.ctx, l.svcCtx.RedisClient, req.Text)
	if err != nil {
		return nil, err
	}

	if Ids, _, err = milvus.GoalCollection.Search(l.ctx, meaning); err != nil {
		return nil, err
	}
	return &types.List{List: Tool.Int64ArrayToStringArray(Ids)}, nil
}

//convert *model.GoalItem to *types.GoalItem
// properties : Id,Name,Markdown,Weight,Risk,Popularity,UpdatedTime
func ConvertGoalModel2GoalItem(item *model.Goal, mine bool) *types.GoalItem {
	reb := &types.GoalItem{
		Id:         Tool.Int64ToString(item.Id),
		Name:       item.Name,
		Detail:     item.Detail,
		Popularity: item.Popularity,
		Risk:       item.Risk,
		Benifites:  item.Benifites,
		Mine:       mine,
	}
	if item.Id == 0 {
		reb.Id = ""
	}
	return reb
}
