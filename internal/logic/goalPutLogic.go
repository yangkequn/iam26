package logic

import (
	"context"
	"math/rand"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/milvus"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type GoalPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGoalPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GoalPutLogic {
	return &GoalPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GoalPutLogic) GoalPut(req *types.GoalItem) (resp *types.GoalItem, err error) {
	var (
		goal     *model.Goal     = nil
		uid      string          = ""
		goalList *model.GoalList = nil
		newGoal  bool            = req.Id == "0"
	)
	//ensure: 1.login is required, 2.  the user is the owner
	if uid, err = UID(l.ctx); err != nil {
		return nil, err
	}
	if newGoal {
		//store goal id to req.id, for later use
		req.Id = GoTools.Int64ToString(rand.Int63())
		//Poularity is 0. if ref by another goal list ,increase the poularity
		goal = &model.Goal{Id: GoTools.StringToInt64(req.Id), Popularity: 0}
		_, err = l.svcCtx.GoalModel.Insert(l.ctx, goal)
		if err != nil {
			return nil, err
		}
	} else {
		goal, err = l.svcCtx.GoalModel.FindOne(l.ctx, GoTools.StringToInt64(req.Id))
	}
	if err != nil {
		return nil, err
	}
	// save req to goal,
	goal.Name = req.Name
	goal.Detail = req.Detail
	goal.Benifites = req.Benifites
	goal.Risk = req.Risk
	goal.Author = uid
	//skipt popularity

	//save goal to goal list
	if goalList, err = l.svcCtx.GoalListModel.FindOne(l.ctx, uid); err != nil {
		//if no row, create one
		if NoRowsInResultSet(err) {
			return nil, err
		}
		//create goal list
		goalList = &model.GoalList{Id: uid, List: req.Id}
		if _, err = l.svcCtx.GoalListModel.Insert(l.ctx, goalList); err != nil {
			return nil, err
		}
	}

	//1. make sure the goal is in the list
	//2. if not, add it,and update popularity
	if GoTools.NonRedundantMerge(&goalList.List, req.Id, true) {
		err = l.svcCtx.GoalListModel.Update(l.ctx, goalList)
		if err != nil {
			return nil, err
		}
		//increase popularity
		goal.Popularity++
	}

	// save goal
	if err = l.svcCtx.GoalModel.Update(l.ctx, goal); err != nil {
		return nil, err
	}

	if !newGoal {
		err = milvus.GoalCollection.RemoveByKey(l.ctx, goal.Id)
		if err != nil {
			return ConvertGoalModel2GoalItem(goal, true), nil
		}
	}
	//build milvus index
	if err = milvus.GoalCollection.Insert(l.ctx, []*model.Goal{goal}); err != nil {
		return nil, err
	}

	return ConvertGoalModel2GoalItem(goal, true), nil
}
