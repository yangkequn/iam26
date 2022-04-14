package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/GoTools"
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

func (l *MeasureIndexGetLogic) MeasureIndexGet(req *types.MeasureIndex) (resp *types.MeasureIndex, err error) {
	var (
		measureList *model.MeasureIndexHistory
		uid         string
		ok          bool
	)
	// todo: add your logic here and delete this line
	if measureList, err = l.svcCtx.MeasureIndexHistoryModel.FindOne(l.ctx, req.Id); err != nil && !NoRowsInResultSet(err) {
		return nil, err
	}
	//UserId 必须从jwt中获取
	uid, ok = l.ctx.Value("id").(string)
	if !ok {
		return nil, err
	}
	// if NoRowsInResultSet,create new measureList to database
	if NoRowsInResultSet(err) {
		measureList = &model.MeasureIndexHistory{
			Id:   uid,
			List: "",
		}
		_, err = l.svcCtx.MeasureIndexHistoryModel.Insert(l.ctx, measureList)
	}
	return &types.MeasureIndex{
		Id:     req.Id,
		UserId: req.UserId,
		List:   GoTools.StringSlit(measureList.List),
	}, err
}
