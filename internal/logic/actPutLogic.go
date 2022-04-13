package logic

import (
	"context"
	"fmt"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/milvus"

	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type ActPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewActPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ActPutLogic {
	return &ActPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ActPutLogic) ActPut(req *types.ActItem) (resp *types.ActItem, err error) {
	var (
		act    *model.Act
		id     int64 = GoTools.StringToInt64(req.ActId)
		newAct bool  = id == 0
		uid    int64
	)
	//login is required, get user id from jwt token
	if uid, err = UID(l.ctx); err != nil {
		return nil, err
	}

	//create new act with req
	if newAct {
		id = GoTools.Sum64String(req.Name + req.Unit)
	}

	if act, err = l.svcCtx.ActModel.FindOne(id); err != nil && !NoRowsInResultSet(err) {
		return nil, err
	}

	if err != nil && NoRowsInResultSet(err) {
		act = &model.Act{Author: uid, Id: id, Name: req.Name, Unit: req.Unit, Detail: req.Detail}
		_, err = l.svcCtx.ActModel.Insert(act)
	}

	//authority check
	if err != nil || act == nil {
		return nil, err
	}

	if act.Author != uid {
		return nil, fmt.Errorf("you are not the author of act")
	}

	//modify model act, and return act
	act.Name = req.Name
	act.Unit = req.Unit
	if len(req.Detail) > 0 {
		act.Detail = req.Detail
	}
	go l.svcCtx.ActModel.Update(act)

	//append act id to user's act list
	//step1. open or create act list
	var actList *model.ActList
	if actList, err = l.svcCtx.ActListModel.FindOne(l.ctx, uid); err != nil {
		// Auto create act list
		if NoRowsInResultSet(err) {
			//create new
			actList = &model.ActList{Id: uid}
			l.svcCtx.ActListModel.Insert(l.ctx, actList)
		}
		if err != nil {
			return ConvertActToResponse(act, true), nil
		}
	}
	//step2. append act id to list
	var actIdString string = GoTools.Int64ToString(act.Id)
	if !strings.Contains(actList.List, actIdString) && GoTools.NonRedundantMerge(&actList.List, actIdString, true) {
		l.svcCtx.ActListModel.Update(l.ctx, actList)
		act.Popularity += 1
		l.svcCtx.ActModel.Update(act)
	}

	// milvus index
	if !newAct {
		//remove former act
		if err = milvus.ActCollection.RemoveByKey(l.ctx, act.Id); err != nil {
			return ConvertActToResponse(act, true), nil
		}
	}
	//build milvus index
	go milvus.ActCollection.Insert(l.ctx, act)
	return ConvertActToResponse(act, true), nil
}
