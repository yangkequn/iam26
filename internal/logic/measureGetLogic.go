package logic

import (
	"context"
	"net/http"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"

	"iam26/model"

	"github.com/yangkequn/GoTools"

	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureGetLogic {
	return &MeasureGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *MeasureGetLogic) MeasureGet(r *http.Request, req *types.FormId) (resp *types.MeasureItem, err error) {
	id := GoTools.StringToInt64(req.Id)
	measure, err := l.svcCtx.MeasureModel.FindOne(id)
	if err != nil {
		return nil, err
	}
	// Check if this Measure is used by user
	var (
		uid         int64
		measureList *model.MeasureList
	)
	uid = GoTools.GetUserIDFromCookie(r, l.svcCtx.Config.Auth.AccessSecret)
	if uid == 0 {
		return ConvertMeasureToResponse(measure, false), nil
	}
	if measureList, err = l.svcCtx.MeasureListModel.FindOne(l.ctx, uid); err != nil {
		return ConvertMeasureToResponse(measure, false), nil
	}
	return ConvertMeasureToResponse(measure, strings.Contains(measureList.List, req.Id)), nil
}

// Convert type model.Measure to type types.MeasureItem
func ConvertMeasureToResponse(measure *model.Measure, mine bool) (resp *types.MeasureItem) {
	resp = &types.MeasureItem{
		MeasureId:  GoTools.Int64ToString(measure.Id),
		Name:       measure.Name,
		Unit:       measure.Unit,
		Detail:     measure.Detail,
		Popularity: measure.Popularity,
		Score:      0,
		Mine:       mine,
	}
	return resp
}
