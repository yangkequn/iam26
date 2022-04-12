package handler

import (
	"net/http"

	"iam26/internal/logic"
	"iam26/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func UserSignOutGetHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := logic.NewUserSignOutGetLogic(r.Context(), svcCtx)
		err := l.UserSignOutGet(r, w)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.Ok(w)
		}
	}
}
