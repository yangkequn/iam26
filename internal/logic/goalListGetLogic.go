package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type GoalListGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGoalListGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GoalListGetLogic {
	return &GoalListGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GoalListGetLogic) GoalListGet() (resp *types.List, err error) {
	var (
		uid      int64
		goalList *model.GoalList
	)

	if uid, err = UID(l.ctx); err != nil {
		return nil, err
	}
	if goalList, err = l.svcCtx.GoalListModel.FindOne(l.ctx, uid); err != nil {
		// Auto create goal list
		if NoRowsInResultSet(err) {
			//create new
			goalList = &model.GoalList{Id: uid}
			_, err = l.svcCtx.GoalListModel.Insert(l.ctx, goalList)
		}
		if err != nil {
			return nil, err
		}

	}
	return &types.List{List: GoTools.StringSlit(goalList.List)}, nil
}
