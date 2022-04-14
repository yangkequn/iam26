package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type UserAccountOccupiedGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserAccountOccupiedGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserAccountOccupiedGetLogic {
	return &UserAccountOccupiedGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserAccountOccupiedGetLogic) UserAccountOccupiedGet(req *types.AccountOccupiedReq) (resp *types.AccountOccupiedRsb, err error) {
	id, err := model.AccountToID(req.Name)
	if err != nil {
		return &types.AccountOccupiedRsb{Error: err.Error()}, nil
	}
	if _, err := l.svcCtx.UserModel.FindOne(l.ctx, id); err == nil {
		return &types.AccountOccupiedRsb{Error: "账号已经存在"}, nil
	}
	return &types.AccountOccupiedRsb{Error: ""}, nil
}
