package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UserPasswordPostLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserPasswordPostLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserPasswordPostLogic {
	return &UserPasswordPostLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserPasswordPostLogic) UserPasswordPost(req *types.ResetReq) (resp *types.ErrorRsb, err error) {
	// todo: add your logic here and delete this line

	return
}
