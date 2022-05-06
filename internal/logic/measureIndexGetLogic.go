package logic

import (
	"context"
	"errors"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureIndexGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureIndexGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureIndexGetLogic {
	return &MeasureIndexGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}
func GenIndexId(user string, indexType string) string {
	return Tool.HashToString(user + "," + indexType)
}
func (l *MeasureIndexGetLogic) MeasureIndexGet(req *types.MeasureIndex) (resp *types.MeasureIndex, err error) {
	var (
		indexList *model.MeasureIndex
		uid       string
	)
	//如果指定了具体的指标记录ID，则直接返回
	//login is required, get user id from jwt token
	if uid, err = Tool.UserIdFromContext(l.ctx); err != nil {
		return nil, err
	}
	if req.Id == "" {
		//使用用户ID和指标名称查询
		req.Id = GenIndexId(uid, req.Type)
	}

	if indexList, err = l.svcCtx.MeasureIndexModel.FindOne(l.ctx, req.Id); err != nil {
		return nil, err
	}

	if !Tool.ValidateJwtUser(l.ctx, uid) {
		return nil, model.ErrAccessNotAllowed
	}

	data := Tool.StringToFloat32Array(indexList.Data)
	time := Tool.StringToInt64Array(indexList.Time)
	if len(data) != len(time) {
		return nil, errors.New("data length not equal time length, index table id:" + indexList.Id)
	}
	return &types.MeasureIndex{
		Id:   req.Id,
		List: Tool.StringSlit(indexList.List),
		Type: req.Type,
		Data: data,
	}, err
}
