package logic

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

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

func ConvertTemporaryAccountToFormalAccount(ctx context.Context, svc *svc.ServiceContext, uidTemporary string, uid string) {

	uTemporary, err := svc.UserModel.FindOne(ctx, uidTemporary)
	if err != nil {
		return
	}
	uTemporary.RootId = uidTemporary
	svc.UserModel.Update(ctx, uTemporary)
}

func (l *UserLoginPostLogic) UserLoginPost(r *http.Request, w http.ResponseWriter, req *types.LoginReq) (resp *types.ErrorRsb, err error) {
	req.Account = strings.ToLower(req.Account)
	id, err := model.AccountToID(req.CountryCode + "|" + req.Account)
	if err != nil {
		return &types.ErrorRsb{Error: err.Error()}, nil
	}
	u, err := l.svcCtx.UserModel.FindOne(l.ctx, id)
	if err != nil {
		if NoRowsInResultSet(err) {
			id, err = model.AccountToID(req.Account)
			if err != nil {
				return &types.ErrorRsb{Error: err.Error()}, nil
			}
			u, err = l.svcCtx.UserModel.FindOne(l.ctx, id)
		}
		if err != nil || u == nil {
			return &types.ErrorRsb{Error: ""}, model.ErrLoginFail
		}
	}
	//一个账号可以有多个账号名，这些账号最终需要追溯到原始根账号
	if len(u.RootId) > 0 && u.RootId != u.Id {
		u, err = l.svcCtx.UserModel.FindOne(l.ctx, u.RootId)
		if err != nil || u == nil {
			return &types.ErrorRsb{Error: ""}, errors.New("LoginFail")
		}
	}

	//把当前临时账号的内容保存到被登录账号
	if uidTemporary, err := GetUserIDFromCookie(r, l.svcCtx.Config.Auth.AccessSecret); err == nil && len(uidTemporary) > 0 {
		//make sure it's temporary account, not root account
		//这里有bug,如果只是两个不同人的账号，而不是临时账号，不应该做合并的操作
		uT, errT := l.svcCtx.UserModel.FindOne(l.ctx, uidTemporary)
		if errT == nil && uT.Password != 0 {
			ConvertTemporaryAccountToFormalAccount(l.ctx, l.svcCtx, uidTemporary, uT.Id)
		}
	}

	cookie, err := u.ToJWTCookie(l.svcCtx.Config.Auth.AccessSecret)
	if err == nil {
		http.SetCookie(w, cookie)
	}
	return &types.ErrorRsb{Error: ""}, nil
}
