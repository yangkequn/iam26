package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ MeasureIndexModel = (*customMeasureIndexModel)(nil)

type (
	// MeasureIndexModel is an interface to be customized, add more methods here,
	// and implement the added methods in customMeasureIndexModel.
	MeasureIndexModel interface {
		measureIndexModel
	}

	customMeasureIndexModel struct {
		*defaultMeasureIndexModel
	}
)

// NewMeasureIndexModel returns a model for the database table.
func NewMeasureIndexModel(conn sqlx.SqlConn) MeasureIndexModel {
	return &customMeasureIndexModel{
		defaultMeasureIndexModel: newMeasureIndexModel(conn),
	}
}
