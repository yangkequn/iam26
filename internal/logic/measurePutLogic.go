package logic

import (
	"context"
	"fmt"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type MeasurePutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMeasurePutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MeasurePutLogic {
	return &MeasurePutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *MeasurePutLogic) MeasurePut(req *types.MeasureItem) (resp *types.MeasureItem, err error) {
	var (
		measure    *model.Measure
		newMeasure bool = req.MeasureId == "0"
		uid        string
	)
	//login is required, get user id from jwt token
	if uid, err = UID(l.ctx); err != nil {
		return nil, err
	}

	if newMeasure {
		req.MeasureId = GoTools.Int64ToString(GoTools.Sum64String(req.Name + req.Unit))
	}
	if measure, err = l.svcCtx.MeasureModel.FindOne(l.ctx, req.MeasureId); err != nil && !NoRowsInResultSet(err) {
		return nil, err
	}
	//is measure not created
	if err != nil && NoRowsInResultSet(err) {
		measure = &model.Measure{Author: uid, Id: req.MeasureId, Name: req.Name, Unit: req.Unit, Detail: req.Detail}
		_, err = l.svcCtx.MeasureModel.Insert(l.ctx, measure)
	}

	//authority check
	if measure.Author != uid {
		return nil, fmt.Errorf("you are not the author of measure")
	}

	//modify model measure, and return measure
	measure.Name = req.Name
	measure.Unit = req.Unit
	if len(req.Detail) > 0 {
		measure.Detail = req.Detail
	}
	go l.svcCtx.MeasureModel.Update(l.ctx, measure)

	//append measure id to user's measure list
	//step1. open or create measure list
	var measureList *model.MeasureList
	if measureList, err = l.svcCtx.MeasureListModel.FindOne(l.ctx, uid); err != nil {
		// Auto create measure list
		if NoRowsInResultSet(err) {
			//create new
			measureList = &model.MeasureList{Id: uid}
			_, err = l.svcCtx.MeasureListModel.Insert(l.ctx, measureList)
		}
		if err != nil {
			return ConvertMeasureToResponse(measure, true), nil
		}
	}
	//step2. append measure id to list
	if !strings.Contains(measureList.List, req.MeasureId) && GoTools.NonRedundantMerge(&measureList.List, req.MeasureId, true) {
		l.svcCtx.MeasureListModel.Update(l.ctx, measureList)
		measure.UseCounter += 1
		l.svcCtx.MeasureModel.Update(l.ctx, measure)
	}

	// //remove redundant measure id from milvus collection
	// if !newMeasure {
	// 	//remove former measure
	// 	if err = milvus.MeasureCollection.RemoveByKey(l.ctx, measure.Id); err != nil {
	// 		return ConvertMeasureToResponse(measure, true), nil
	// 	}
	// }
	// //err = milvus.MeasureContext.CreateCollection(l.ctx)
	// err = milvus.MeasureCollection.Insert(l.ctx, []*model.Measure{measure})
	// if err != nil {
	// 	return ConvertMeasureToResponse(measure, true), nil
	// }
	return ConvertMeasureToResponse(measure, true), nil
}
