package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UserProfilePutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserProfilePutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserProfilePutLogic {
	return &UserProfilePutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserProfilePutLogic) UserProfilePut(req *types.MyProfileChangeReq) (resp *types.ErrorRsb, err error) {
	uid, uErr := UID(l.ctx)
	if uErr != nil {
		return nil, uErr
	}
	u, err := l.svcCtx.UserModel.FindOne(l.ctx, uid)
	if err != nil && u.Id != 0 {
		u.Nick = req.ChannelName
		u.Account = req.LoginAccount
		l.svcCtx.UserModel.Update(l.ctx, u)
		return &types.ErrorRsb{Error: ""}, nil
	}
	return &types.ErrorRsb{Error: "user invalid"}, nil
}
