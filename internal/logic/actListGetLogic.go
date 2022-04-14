package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type ActListGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewActListGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ActListGetLogic {
	return &ActListGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ActListGetLogic) ActListGet() (resp *types.List, err error) {
	var (
		uid     string
		actList *model.ActList
	)

	if uid, err = UID(l.ctx); err != nil {
		return nil, err
	}
	if actList, err = l.svcCtx.ActListModel.FindOne(l.ctx, uid); err != nil {
		// Auto create act list
		if NoRowsInResultSet(err) {
			//create new
			actList = &model.ActList{Id: uid}
			l.svcCtx.ActListModel.Insert(l.ctx, actList)
		}
		if err != nil {
			return nil, err
		}

	}
	return &types.List{List: GoTools.StringSlit(actList.List)}, nil
}
