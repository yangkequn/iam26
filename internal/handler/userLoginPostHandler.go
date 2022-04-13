package handler

import (
	"net/http"

	"iam26/internal/logic"
	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func UserLoginPostHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.LoginReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewUserLoginPostLogic(r.Context(), svcCtx)
		resp, err := l.UserLoginPost(r, w, &req)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.OkJson(w, resp)
		}
	}
}