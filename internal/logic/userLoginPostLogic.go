package logic

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type UserLoginPostLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserLoginPostLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserLoginPostLogic {
	return &UserLoginPostLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func ConvertTemporaryAccountToFormalAccount(ctx context.Context, svcCtx *svc.ServiceContext, uidTemporary int64, uid int64) {

	SetRootIDOnTemporaryAccount(ctx, svcCtx, uidTemporary, uid)
}

func SetRootIDOnTemporaryAccount(ctx context.Context, svc *svc.ServiceContext, uidTemporary int64, uid int64) {
	uTemporary, err := svc.UserModel.FindOne(ctx, uidTemporary)
	if err != nil {
		return
	}
	uTemporary.RootId = uidTemporary
	svc.UserModel.Update(ctx, uTemporary)
}

func (l *UserLoginPostLogic) UserLoginPost(r *http.Request, w http.ResponseWriter, req *types.LoginReq) (resp *types.ErrorRsb, err error) {
	req.Account = strings.ToLower(req.Account)
	id := model.AccountToID(req.CountryCode + "|" + req.Account)
	u, err := l.svcCtx.UserModel.FindOne(l.ctx, id)
	if err != nil || u == nil {
		u, err = l.svcCtx.UserModel.FindOne(l.ctx, model.AccountToID(req.Account))
		if err != nil || u == nil {
			return &types.ErrorRsb{Error: ""}, model.ErrLoginFail
		}
	}
	//一个账号可以有多个账号名，这些账号最终需要追溯到原始根账号
	if u.RootId != 0 {
		u, err = l.svcCtx.UserModel.FindOne(l.ctx, u.RootId)
		if err != nil || u == nil {
			return &types.ErrorRsb{Error: ""}, errors.New("LoginFail")
		}
	}

	//把当前临时账号的内容保存到被登录账号
	uidTemporary := GoTools.GetUserIDFromCookie(r, l.svcCtx.Config.Auth.AccessSecret)
	if uidTemporary != 0 {
		ConvertTemporaryAccountToFormalAccount(l.ctx, l.svcCtx, uidTemporary, u.Id)
	}

	cookie, err := u.ToJWTCookie(l.svcCtx.Config.Auth.AccessSecret)
	if err == nil {
		http.SetCookie(w, cookie)
	}
	return &types.ErrorRsb{Error: ""}, nil
}
