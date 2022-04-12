package logic

import (
	"context"
	"net/http"

	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type UserAvatarGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserAvatarGetLogic(ctx context.Context, w http.ResponseWriter, svcCtx *svc.ServiceContext) *UserAvatarGetLogic {
	return &UserAvatarGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserAvatarGetLogic) UserAvatarGet(w http.ResponseWriter, req *types.AccountID) error {
	uid := GoTools.StringToInt64(req.Id)
	if uid == 0 {
		return nil
	}

	u, er := l.svcCtx.UserModel.FindOne(l.ctx, uid)
	if er != nil {
		return er
	}
	if len(u.Avatar) == 0 {
		return nil
	}
	avatar := []byte(u.Avatar)
	w.Header().Set("Content-Type", "image/webp")
	w.Write(avatar)
	return nil
}
