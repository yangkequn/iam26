package logic

import (
	"context"
	"net/http"

	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UserGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserGetLogic {
	return &UserGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserGetLogic) UserGet(w http.ResponseWriter, req *types.AccountID) (resp *types.NameRsp, err error) {
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, req.Id)
	w.Header().Add("Cache-Control", "public,max-age=86400")
	if err == nil {
		return &types.NameRsp{Name: user.Nick}, nil
	}
	return &types.NameRsp{Name: ""}, nil
}
