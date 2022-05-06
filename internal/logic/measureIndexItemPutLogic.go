package logic

import (
	"context"
	"errors"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type MeasureIndexItemPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasureIndexItemPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasureIndexItemPutLogic {
	return &MeasureIndexItemPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

// 约定：req.Data, req.List 为新的增量信息
func (l *MeasureIndexItemPutLogic) MeasureIndexItemPut(req *types.MeasureIndex) (resp *types.MeasureIndex, err error) {
	var (
		indexList *model.MeasureIndex
		uid       string
	)
	//如果指定了具体的指标记录ID，则直接返回
	//login is required, get user id from jwt token
	if uid, err = Tool.UserIdFromContext(l.ctx); err != nil {
		return nil, model.ErrAccessNotAllowed
	}
	if req.Id == "" {
		req.Id = GenIndexId(uid, req.Type)
	}
	// bn
	indexList, err = l.svcCtx.MeasureIndexModel.FindOne(l.ctx, req.Id)
	if err != nil && !NoRowsInResultSet(err) {
		return nil, err
	}
	if err != nil && NoRowsInResultSet(err) {
		indexList = &model.MeasureIndex{Id: req.Id, User: uid, Type: req.Type}
		_, err = l.svcCtx.MeasureIndexModel.Insert(l.ctx, indexList)
	}

	if len(req.Data)%3 != 0 {
		return nil, errors.New("data format corruped:" + indexList.Id)
	}
	//if data list too long, save to another row
	var keptNum = 256
	if len(indexList.Data) > 4096 {
		newIndexList := &model.MeasureIndex{
			Id:   GenIndexId(uid, req.Type),
			User: uid,
			Type: req.Type,
			Data: indexList.Data[keptNum:],
			Time: indexList.Time[keptNum:],
			List: indexList.List[keptNum:],
		}
		l.svcCtx.MeasureIndexModel.Insert(l.ctx, newIndexList)

		indexList.Data = indexList.Data[len(indexList.Data)-keptNum:]
		indexList.Time = indexList.Time[len(indexList.Time)-keptNum:]
		indexList.List = strings.Trim(indexList.List+","+newIndexList.Id, ",")
		l.svcCtx.MeasureIndexModel.Update(l.ctx, indexList)
	}
	return &types.MeasureIndex{
		Id:   req.Id,
		List: Tool.StringSlit(indexList.List),
		Type: req.Type,
		Data: Tool.StringToFloat32Array(indexList.Data),
	}, nil

}
