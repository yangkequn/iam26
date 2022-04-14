package logic

import (
	"context"
	"net/http"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type GoalGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGoalGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GoalGetLogic {
	return &GoalGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GoalGetLogic) GoalGet(r *http.Request, req *types.FormId) (resp *types.GoalItem, err error) {
	var (
		IsMyGoal bool = false
		uid      string
		goalList *model.GoalList
	)
	id := GoTools.StringToInt64(req.Id)
	goal, err := l.svcCtx.GoalModel.FindOne(l.ctx, id)
	if err != nil {
		return nil, err
	}
	//get uid from cookie
	if uid, err = GetUserIDFromCookie(r, l.svcCtx.Config.Auth.AccessSecret); err != nil {
		return ConvertGoalModel2GoalItem(goal, false), err
	}
	//check if this goal is mine
	goalList, err = l.svcCtx.GoalListModel.FindOne(l.ctx, uid)
	if err == nil && strings.Contains(goalList.List, req.Id) {
		IsMyGoal = true
	}

	return ConvertGoalModel2GoalItem(goal, IsMyGoal), nil
}
