package logic

import (
	"context"
	"fmt"
	"strings"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/milvus"
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
		id         int64 = GoTools.StringToInt64(req.MeasureId)
		newMeasure bool  = id == 0
		uid        int64
	)
	//login is required, get user id from jwt token
	if uid, err = UID(l.ctx); err != nil {
		return nil, err
	}

	if newMeasure {
		id = GoTools.Sum64String(req.Name + req.Unit)
	}
	if measure, err = l.svcCtx.MeasureModel.FindOne(id); err != nil {
		if NoRowsInResultSet(err) {
			measure = &model.Measure{Author: uid, Id: id, Name: req.Name, Unit: req.Unit, Detail: req.Detail, Popularity: 1}
			_, err = l.svcCtx.MeasureModel.Insert(measure)
		}
	}
	if err != nil || measure == nil {
		return nil, err
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
	go l.svcCtx.MeasureModel.Update(measure)

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
	var measureIdString string = GoTools.Int64ToString(measure.Id)
	if !strings.Contains(measureList.List, measureIdString) && GoTools.NonRedundantMerge(&measureList.List, measureIdString, true) {
		l.svcCtx.MeasureListModel.Update(l.ctx, measureList)
	}

	//remove redundant measure id from milvus collection
	if !newMeasure {
		err = milvus.MeasureCollection.RemoveByKey(l.ctx, measure.Id)
		if err != nil {
			return ConvertMeasureToResponse(measure, true), nil
		}
	}
	//err = milvus.MeasureContext.CreateCollection(l.ctx)
	err = milvus.MeasureCollection.Insert(l.ctx, []*model.Measure{measure})
	if err != nil {
		return ConvertMeasureToResponse(measure, true), nil
	}
	return ConvertMeasureToResponse(measure, true), nil
}
