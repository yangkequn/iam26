package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ MeasureModel = (*customMeasureModel)(nil)

type (
	// MeasureModel is an interface to be customized, add more methods here,
	// and implement the added methods in customMeasureModel.
	MeasureModel interface {
		measureModel
	}

	customMeasureModel struct {
		*defaultMeasureModel
	}
)

// NewMeasureModel returns a model for the database table.
func NewMeasureModel(conn sqlx.SqlConn) MeasureModel {
	return &customMeasureModel{
		defaultMeasureModel: newMeasureModel(conn),
	}
}
