package handler

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"iam26/internal/logic"
	"iam26/internal/svc"
	"iam26/internal/types"
)

func UserProfilePutHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.MyProfileChangeReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewUserProfilePutLogic(r.Context(), svcCtx)
		resp, err := l.UserProfilePut(&req)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.OkJson(w, resp)
		}
	}
}