package logic

import (
	"context"
	"fmt"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/milvus"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type GoalDelLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGoalDelLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GoalDelLogic {
	return &GoalDelLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GoalDelLogic) GoalDel(req *types.GoalItem) (resp *types.GoalItem, err error) {
	var (
		Id       int64
		uid      string
		item     *model.Goal
		goalList *model.GoalList
	)

	//get uid
	if uid, err = UID(l.ctx); err != nil {
		return nil, err
	}
	//never remove the goal actually if the Popularity above 1,which means the goal is in use by other users
	//otherwise the goal will be removed
	if Id = GoTools.StringToInt64(req.Id); Id == 0 {
		return nil, fmt.Errorf("id is empty")
	}
	if item, err = l.svcCtx.GoalModel.FindOne(l.ctx, Id); err != nil {
		return nil, err
	}
	//update goal's popularity
	item.Popularity--
	if item.Popularity == 0 {
		//ensure: the user is the owner
		if item.Author != uid {
			return nil, fmt.Errorf("you are not the owner")
		}

		if err = l.svcCtx.GoalModel.Delete(l.ctx, Id); err != nil {
			return nil, err
		}
		//remove from milvus
		if err = milvus.GoalCollection.RemoveByKey(l.ctx, Id); err != nil {
			return nil, err
		}
	} else {
		if err = l.svcCtx.GoalModel.Update(l.ctx, item); err != nil {
			return nil, err
		}
		//update milvus
		dataToUpdate := []*model.Goal{item}
		if err = milvus.GoalCollection.Insert(l.ctx, dataToUpdate); err != nil {
			return nil, err
		}
	}

	//remove goalID from the list field in model.GoalList
	if goalList, err = l.svcCtx.GoalListModel.FindOne(l.ctx, uid); err != nil {
		return nil, err
	}
	//if goalID removed ,then update goalList; else nothing changed and do nothing
	if GoTools.RemoveItemFromString(&goalList.List, req.Id) {
		if err = l.svcCtx.GoalListModel.Update(l.ctx, goalList); err != nil {
			return nil, err
		}
	}

	// id shout not be 0,or error
	if Id = GoTools.StringToInt64(req.Id); Id == 0 {
		return nil, fmt.Errorf("id is required")
	}

	// unset traceItem.TraceId
	item.Id = 0
	return ConvertGoalModel2GoalItem(item, true), nil
}
