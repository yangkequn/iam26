package logic

import (
	"context"
	"fmt"
	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"
	"net/http"
	"strings"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type ActGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewActGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ActGetLogic {
	return &ActGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ActGetLogic) ActGet(r *http.Request, req *types.FormId) (resp *types.ActItem, err error) {
	if req.Id == "" {
		return nil, fmt.Errorf("act id is required")
	}
	reqId := GoTools.StringToInt64(req.Id)
	act, err := l.svcCtx.ActModel.FindOne(l.ctx, reqId)
	if err != nil {
		return nil, err
	}

	// Check if this Act is used by user
	var (
		uid     string
		actList *model.ActList
	)
	uid, err = GetUserIDFromCookie(r, l.svcCtx.Config.Auth.AccessSecret)
	if err != nil {
		return ConvertActToResponse(act, false), err
	}
	if actList, err = l.svcCtx.ActListModel.FindOne(l.ctx, uid); err != nil {
		return ConvertActToResponse(act, false), nil
	}
	return ConvertActToResponse(act, strings.Contains(actList.List, req.Id)), nil
}

// Convert type model.Act to type types.ActItem
func ConvertActToResponse(act *model.Act, mine bool) (resp *types.ActItem) {
	resp = &types.ActItem{
		ActId:      GoTools.Int64ToString(act.Id),
		Name:       act.Name,
		Unit:       act.Unit,
		Detail:     act.Detail,
		Popularity: act.UseCounter,
		Score:      0,
		Mine:       mine,
	}

	return resp
}
