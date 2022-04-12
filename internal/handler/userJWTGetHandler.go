package handler

import (
	"net/http"

	"iam26/internal/logic"
	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func UserJWTGetHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.JwtReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewUserJWTGetLogic(r.Context(), svcCtx)
		resp, err := l.UserJWTGet(&req, r, w)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.OkJson(w, resp)
		}
	}
}
