package logic

import (
	"context"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UserProfileGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserProfileGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserProfileGetLogic {
	return &UserProfileGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserProfileGetLogic) UserProfileGet() (resp *types.MyProfileReturn, err error) {
	uid, uErr := UID(l.ctx)
	if uErr != nil {
		return nil, uErr
	}
	u, err := l.svcCtx.UserModel.FindOne(l.ctx, uid)
	if err != nil {
		return &types.MyProfileReturn{Succ: false}, nil
	}
	countryPhone := strings.Split(u.CountryPhone, "|")
	country, phone := countryPhone[0], countryPhone[1]
	return &types.MyProfileReturn{Succ: true, CountryCode: country, Phone: phone, Introduction: u.Introduction, RealName: ""}, nil
}
