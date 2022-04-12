package logic

import (
	"context"
	"net/http"
	"time"

	"iam26/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
)

type UserSignOutGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserSignOutGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserSignOutGetLogic {
	return &UserSignOutGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserSignOutGetLogic) UserSignOutGet(r *http.Request, w http.ResponseWriter) error {
	cookie := http.Cookie{Name: "Authorization", Value: "deleted", Path: "/", Expires: time.Now().Add(-time.Hour * 24), HttpOnly: true}
	http.SetCookie(w, &cookie)
	return nil
}
