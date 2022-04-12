package handler

import (
	"net/http"

	"iam26/internal/logic"
	"iam26/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func UserAvatarPutHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := logic.NewUserAvatarPutLogic(r.Context(), svcCtx)
		err := l.UserAvatarPut(r)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.Ok(w)
		}
	}
}
