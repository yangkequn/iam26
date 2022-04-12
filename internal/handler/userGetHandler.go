package handler

import (
	"net/http"

	"iam26/internal/logic"
	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func UserGetHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.AccountID
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewUserGetLogic(r.Context(), svcCtx)
		resp, err := l.UserGet(w, &req)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.OkJson(w, resp)
		}
	}
}
